import type { NextRequest } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';
import { cookies } from 'next/headers';

import { withDatabase } from '@/backend/connection';
import { HTTP_STATUS } from '@/backend/constants/http-status';
import { signToken } from '@/backend/libs/jwt';
import { getClientIP, getUserAgent } from '@/backend/libs/metadata';
import { createRedisKey, redis } from '@/backend/libs/redis';
import {
  apiError,
  apiSuccess,
  internalServerError,
} from '@/backend/libs/response';
import { validateRequest } from '@/backend/libs/validation';
import User from '@/backend/models/user';
import { isProduction } from '@/core/libs/env';
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

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

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

      // Create new session
      const sessionInfo = await getUserAgent(req);

      user.sessions.push({
        ...sessionInfo,
        accessToken,
        refreshToken,
        type: 'credential',
      });

      await user.save();

      const cookieStore = await cookies();

      // Set Access Token Cookie
      cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction(),
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });

      cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction(),
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return apiSuccess(
        HTTP_STATUS.OK.message,
        HTTP_STATUS.OK.code,
        null,
        'Login successful',
      );
    });
  } catch (error) {
    return internalServerError(error);
  }
}
