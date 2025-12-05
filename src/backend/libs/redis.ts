import 'server-only';

import { Redis } from '@upstash/redis';

import { envServer } from '@/core/config/env';

/**
 * Redis client instance initialized with Upstash configuration.
 * Uses REST URL and Token from server-side environment variables.
 * This instance should be used for all Redis operations in the backend.
 */
export const redis = new Redis({
  url: envServer.UPSTASH_REDIS_REST_URL,
  token: envServer.UPSTASH_REDIS_REST_TOKEN,
});
