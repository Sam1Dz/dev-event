import type { NextRequest } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';
import { cookies, headers } from 'next/headers';

import { withDatabase } from '@/backend/connection';
import { HTTP_STATUS } from '@/backend/constants/http-status';
import { signToken } from '@/backend/libs/jwt';
import { createRedisKey, redis } from '@/backend/libs/redis';
import {
  apiError,
  apiSuccess,
  internalServerError,
} from '@/backend/libs/response';
import { validateRequest } from '@/backend/libs/validation';
import User from '@/backend/models/user';
import { loginSchema } from '@/core/schema/user';

const ipLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 m'),
  analytics: true,
  prefix: 'login/ratelimit/ip',
});

const emailLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'login/ratelimit/email',
});

/**
 * POST /api/auth/login
 * Handles user login.
 * Validates credentials, enforces rate limits, issues tokens, and sets secure cookies.
 */
export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1';

    // IP-based rate limit: 10 attempts per 10 minutes
    const { success: ipSuccess } = await ipLimiter.limit(
      createRedisKey(`ratelimit:login:${ip}`),
    );

    if (!ipSuccess) {
      return apiError(
        HTTP_STATUS.TOO_MANY_REQUESTS.message,
        HTTP_STATUS.TOO_MANY_REQUESTS.code,
        [
          {
            detail:
              'Too many login attempts from this IP. Please try again later.',
            attr: null,
          },
        ],
      );
    }

    const body = await validateRequest(req, loginSchema);

    // Email-based rate limit: 5 attempts per 15 minutes
    const { success: emailSuccess } = await emailLimiter.limit(
      createRedisKey(`ratelimit:login:${body.email}`),
    );

    if (!emailSuccess) {
      return apiError(
        HTTP_STATUS.TOO_MANY_REQUESTS.message,
        HTTP_STATUS.TOO_MANY_REQUESTS.code,
        [
          {
            detail:
              'Too many login attempts for this email. Please try again later.',
            attr: null,
          },
        ],
      );
    }

    return await withDatabase(async () => {
      // Fetch user with password field (explicitly selected)
      const user = await User.findOne({ email: body.email }).select(
        '+password',
      );
      const invalidCredentialsError = apiError(
        HTTP_STATUS.UNAUTHORIZED.message,
        HTTP_STATUS.UNAUTHORIZED.code,
        [{ detail: 'Invalid credentials', attr: null }],
      );

      if (!user) {
        return invalidCredentialsError;
      }

      const isPasswordValid = await user.comparePassword(body.password);

      if (!isPasswordValid) {
        return invalidCredentialsError;
      }

      const accessToken = await signToken({ userId: user._id }, '15m');
      const refreshToken = await signToken({ userId: user._id }, '7d');

      // Rotate refresh token in database
      user.refreshToken = refreshToken;
      await user.save();

      const cookieStore = await cookies();

      // Set Access Token Cookie
      cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });

      cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      const responseData = body.returnToken
        ? {
            accessToken,
            refreshToken,
          }
        : null;

      return apiSuccess(
        HTTP_STATUS.OK.message,
        HTTP_STATUS.OK.code,
        responseData,
        'Login successful',
      );
    });
  } catch (error) {
    if (error instanceof Response) return error;

    return internalServerError(error);
  }
}
