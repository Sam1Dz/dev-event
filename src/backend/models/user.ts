import 'server-only';

import bcrypt from 'bcryptjs';
import mongoose, { Schema, type Model } from 'mongoose';

import type { UserModels } from '@/core/types/user';

/**
 * Mongoose schema definition for the User model.
 * Includes validation, timestamps, and password handling.
 */
const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: 'Please enter a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Pre-save middleware to hash the password before saving.
 * Only hashes if the password field has been modified.
 */
UserSchema.pre<UserModels>('save', async function () {
  // Skip hashing if password hasn't changed
  if (!this.isModified('password')) {
    return;
  }

  try {
    // Generate salt with cost factor 12
    const salt = await bcrypt.genSalt(12);

    // Hash the password with the generated salt
    this.password = await bcrypt.hash(this.password!, salt);
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
});

/**
 * Instance method to verify a password against the stored hash.
 * @param candidatePassword - The plain text password to check.
 * @returns Promise<boolean> - True if valid, false otherwise.
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password!);
};

/**
 * User Mongoose Model.
 * Uses a singleton pattern to prevent model recompilation errors in Next.js development mode.
 */
const User: Model<UserModels> =
  mongoose.models.User || mongoose.model<UserModels>('User', UserSchema);

export default User;
