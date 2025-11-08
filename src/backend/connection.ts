import 'server-only';

import mongoose from 'mongoose';

import { envServer } from '@/core/config/env';
import type { MongoEntityId, MongooseConnection } from '@/core/types/mongodb';

/** Global MongoDB connection cache for reuse across serverless function invocations */
const cached: MongooseConnection = global.mongoose || {
  conn: null,
  promise: null,
};

// Initialize global cache if not already set
if (!global.mongoose) {
  global.mongoose = cached;
}

const MONGODB_URI = envServer.MONGODB_URI;

/**
 * Establishes or retrieves a cached MongoDB connection.
 * Returns existing connection if available; prevents multiple simultaneous connections via promise caching.
 * @returns {Promise<typeof mongoose>} Connected Mongoose instance
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Initiate connection only if not already pending
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      dbName: envServer.MONGODB_DB_NAME,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;

    return cached.conn;
  } catch (error) {
    // Clear promise on error to allow retry on next call
    cached.promise = null;
    throw error;
  }
}

/**
 * Executes a handler function with an active database connection.
 * Ensures connection is established before running handler logic.
 * @template T - Return type of the handler function
 * @param {() => Promise<T>} handler - Async function to execute with database connection
 * @returns {Promise<T>} Result from handler function
 */
export async function withDatabase<T>(handler: () => Promise<T>): Promise<T> {
  await connectToDatabase();

  return handler();
}

/**
 * Converts MongoDB ObjectId to string representation.
 * @param {MongoEntityId} id - MongoDB ObjectId
 * @returns {string} String representation of the ObjectId
 */
export function stringifyObjectId(id: MongoEntityId): string {
  return id.toString();
}
