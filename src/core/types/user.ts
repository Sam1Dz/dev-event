import type { Document } from 'mongoose';

export interface UserModels extends Document {
  name: string;
  email: string;
  password?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
