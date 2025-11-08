import 'server-only';

import mongoose from 'mongoose';

import { envServer } from '@/core/config/env';

/** Global MongoDB connection cache for reuse across serverless function invocations */
declare global {
  var mongoConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = envServer.MONGODB_URI;

// Initialize or retrieve cached connection state
let cached = global.mongoConnection;

if (!cached) {
  cached = global.mongoConnection = { conn: null, promise: null };
}

/**
 * Establishes or retrieves a cached MongoDB connection.
 * Returns existing connection if available; prevents multiple simultaneous connections via promise caching.
 * @returns {Promise<typeof mongoose>} Connected Mongoose instance
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Return pending connection promise if currently connecting
  if (cached.promise) {
    return cached.promise;
  }

  // Initiate new connection with optimized pool settings
  cached.promise = mongoose
    .connect(MONGODB_URI, {
      dbName: envServer.MONGODB_DB_NAME,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    .then((mongooseInstance) => {
      cached.conn = mongooseInstance;

      return mongooseInstance;
    })
    .catch((error) => {
      // Clear promise on error to allow retry on next call
      cached.promise = null;
      throw error;
    });

  return cached.promise;
}

/**
 * Closes the MongoDB connection and clears the cache.
 * Safe to call multiple times; no-op if not connected.
 * @returns {Promise<void>}
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
  }
  cached.promise = null;
}

/**
 * Returns current MongoDB connection status.
 * Useful for health checks and debugging connection state.
 * @returns {Object} Connection status flags
 */
export function getConnectionStatus(): {
  isConnected: boolean;
  isConnecting: boolean;
} {
  return {
    isConnected: cached.conn !== null,
    isConnecting: cached.promise !== null && cached.conn === null,
  };
}
