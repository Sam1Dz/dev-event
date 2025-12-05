import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const envServer = createEnv({
  server: {
    MONGODB_URI: z.url().min(1, 'MONGODB_URI cannot be empty'),
    MONGODB_DB_NAME: z.string().min(1, 'MONGODB_DB_NAME cannot be empty'),
    UPSTASH_REDIS_REST_URL: z
      .url()
      .min(1, 'UPSTASH_REDIS_REST_URL cannot be empty'),
    UPSTASH_REDIS_REST_TOKEN: z
      .string()
      .min(1, 'UPSTASH_REDIS_REST_TOKEN cannot be empty'),
  },
  experimental__runtimeEnv: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
});

export const envPublic = createEnv({
  client: {
    NEXT_PUBLIC_IS_TESTING: z.string().default('false'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_IS_TESTING: process.env.NEXT_PUBLIC_IS_TESTING,
  },
});
