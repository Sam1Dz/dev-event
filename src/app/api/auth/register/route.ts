import { Ratelimit } from '@upstash/ratelimit';
import { headers } from 'next/headers';

import { withDatabase } from '@/backend/connection';
import { HTTP_STATUS } from '@/backend/constants/http-status';
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
 * POST /api/auth/register
 * Handles user registration.
 * Includes rate limiting, input validation, honeypot check, and user creation.
 */
export async function POST(request: Request) {
  return withDatabase(async () => {
    try {
      const headersList = await headers();
      const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1';

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

      const body = await validateRequest(request, registerSchema);

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
