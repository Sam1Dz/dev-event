import type { Document } from 'mongoose';
import type { z } from 'zod';

import type { loginSchema, registerSchema } from '@/core/schema/user';

/* MODELS */
export interface UserModels extends Document {
  name: string;
  email: string;
  password?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/* SCHEMAS */
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
