import type { NextRequest } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';

import { withDatabase } from '@/backend/connection';
import { HTTP_STATUS } from '@/backend/constants/http-status';
import { getClientIP } from '@/backend/libs/metadata';
import { createRedisKey, redis } from '@/backend/libs/redis';
import {
  apiError,
  apiSuccess,
  internalServerError,
} from '@/backend/libs/response';
import { validateRequest } from '@/backend/libs/validation';
import User from '@/backend/models/user';
import { registerSchema } from '@/core/schema/user';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'register/ratelimit/ip',
});

/**
 * POST /api/v1/auth/register
 * Handles user registration.
 * detailed checks include rate limiting, input validation, and honeypot field verification.
 * Creates a new user if the email is unique.
 */
export async function POST(req: NextRequest) {
  return withDatabase(async () => {
    try {
      const ip = getClientIP(req);

      // Rate limit: 3 requests per hour per IP
      const { success } = await ratelimit.limit(
        createRedisKey(`ratelimit:register:${ip}`),
      );

      if (!success) {
        return apiError(
          HTTP_STATUS.TOO_MANY_REQUESTS.message,
          HTTP_STATUS.TOO_MANY_REQUESTS.code,
          [
            {
              detail: 'Too many registration attempts. Please try again later.',
              attr: null,
            },
          ],
        );
      }

      const body = await validateRequest(req, registerSchema);

      // Honeypot check: _honey field should be empty
      if (body._honey) {
        return apiError(
          HTTP_STATUS.BAD_REQUEST.message,
          HTTP_STATUS.BAD_REQUEST.code,
          [{ detail: 'Invalid request', attr: '_honey' }],
        );
      }

      const existingUser = await User.findOne({ email: body.email });

      // If user exists, return success to prevent email enumeration
      if (existingUser) {
        return apiSuccess(
          HTTP_STATUS.OK.message,
          HTTP_STATUS.OK.code,
          null,
          'If this email is valid, you will be able to log in.',
        );
      }

      await User.create({
        name: body.name,
        email: body.email,
        password: body.password,
      });

      return apiSuccess(
        HTTP_STATUS.CREATED.message,
        HTTP_STATUS.CREATED.code,
        null,
        'Registration successful. Please log in.',
      );
    } catch (error) {
      return internalServerError(error);
    }
  });
}
