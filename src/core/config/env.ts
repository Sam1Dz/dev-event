import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const envServer = createEnv({
  server: {
    MONGODB_URI: z.url().min(1, 'MONGODB_URI cannot be empty'),
    MONGODB_DB_NAME: z.string().min(1, 'MONGODB_DB_NAME cannot be empty'),
  },
  experimental__runtimeEnv: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  },
});
