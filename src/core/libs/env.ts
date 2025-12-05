import { envPublic } from '@/core/config/env';

/** Current Node environment (e.g., 'development', 'production', 'test'). */
export const NODE_ENV = process.env.NODE_ENV;

/** Flag indicating if the application is running in a testing mode. */
export const IS_TESTING = envPublic.NEXT_PUBLIC_IS_TESTING;

/**
 * Determines if the application is running in the production environment.
 * Returns false if the testing flag is set, regardless of NODE_ENV.
 *
 * @returns True if in production and not testing, false otherwise.
 */
export function isProduction() {
  if (IS_TESTING) return false;

  return NODE_ENV === 'production';
}
