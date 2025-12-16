import type { Document } from 'mongoose';
import type { z } from 'zod';

import type { loginSchema, registerSchema } from '@/core/schema/user';

/* MODELS */
export interface Session {
  refreshToken?: string;
  os?: string;
  browser?: string;
  ip?: string;
  location?: string;
  type?: 'credential' | 'github';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserModels extends Document {
  name: string;
  email: string;
  password?: string;
  sessions: Session[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/* SCHEMAS */
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
