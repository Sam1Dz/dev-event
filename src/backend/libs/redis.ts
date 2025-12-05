import 'server-only';

import { Redis } from '@upstash/redis';

import { envServer } from '@/core/config/env';
import { isProduction } from '@/core/libs/env';

/**
 * Redis client instance initialized with Upstash configuration.
 * Uses REST URL and Token from server-side environment variables.
 * This instance should be used for all Redis operations in the backend.
 */
export const redis = new Redis({
  url: envServer.UPSTASH_REDIS_REST_URL,
  token: envServer.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Creates a namespaced Redis key based on the current environment.
 * Prefixes the key with 'production' or 'development' to prevent collisions.
 *
 * @param location - The specific key identifier or path.
 * @returns The fully namespaced Redis key.
 */
export function createRedisKey(location: string) {
  return `${isProduction() ? 'production' : 'development'}:${location}`;
}
