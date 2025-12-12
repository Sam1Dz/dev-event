import type { NextRequest } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';

import { HTTP_STATUS } from '@/backend/constants/http-status';
import { setCsrfCookie } from '@/backend/libs/csrf';
import { getClientIP } from '@/backend/libs/metadata';
import { createRedisKey, redis } from '@/backend/libs/redis';
import {
  apiError,
  apiSuccess,
  internalServerError,
} from '@/backend/libs/response';

const csrfLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: 'csrf/ratelimit/ip',
});

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    const { success: ipSuccess } = await csrfLimiter.limit(
      createRedisKey(`ratelimit:csrf:${ip}`),
    );

    if (!ipSuccess) {
      return apiError(
        HTTP_STATUS.TOO_MANY_REQUESTS.message,
        HTTP_STATUS.TOO_MANY_REQUESTS.code,
        [
          {
            detail:
              'Too many CSRF token request from this IP. Please try again later.',
            attr: null,
          },
        ],
      );
    }

    await setCsrfCookie();

    return apiSuccess(
      HTTP_STATUS.OK.message,
      HTTP_STATUS.OK.code,
      null,
      'CSRF token set',
    );
  } catch (error) {
    return internalServerError(error);
  }
}
