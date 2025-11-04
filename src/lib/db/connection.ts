import 'server-only';

import mongoose from 'mongoose';

import { envServer } from '@/config/env';

/**
 * Global declaration for MongoDB connection caching.
 * Uses the global namespace to persist connection state across hot module reloads
 * in development, preventing multiple connection attempts.
 *
 * @global
 * @property {Object} mongoConnection - Connection cache object
 * @property {typeof mongoose | null} mongoConnection.conn - Active Mongoose connection instance
 * @property {Promise<typeof mongoose> | null} mongoConnection.promise - Promise of connection in progress
 */
declare global {
  var mongoConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = envServer.MONGODB_URI;

/**
 * Initialize or retrieve the cached MongoDB connection.
 * Ensures only one connection instance exists across the application.
 */
let cached = global.mongoConnection;

// Initialize cache object if it doesn't exist (first app load)
if (!cached) {
  cached = global.mongoConnection = { conn: null, promise: null };
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 *
 * Implements connection pooling and caching strategies:
 * - Returns existing connection if available (reuse)
 * - Returns pending promise if connection is already in progress (prevent duplicates)
 * - Creates new connection only on first call or after disconnection
 *
 * Connection options:
 * - Max pool size: 10 concurrent connections
 * - Min pool size: 2 warm connections
 * - Server selection timeout: 10 seconds
 * - Socket timeout: 45 seconds
 *
 * @async
 * @returns {Promise<typeof mongoose>} The Mongoose instance with active MongoDB connection
 * @throws {Error} If connection fails after retry attempts or server is unavailable
 *
 * @example
 * const mongoose = await connectDB();
 * // Now safe to use mongoose models
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Return pending promise if connection is already in progress
  // This prevents multiple simultaneous connection attempts
  if (cached.promise) {
    return cached.promise;
  }

  // Initiate new connection with pooling and timeout configuration
  cached.promise = mongoose
    .connect(MONGODB_URI, {
      dbName: envServer.MONGODB_DB_NAME,
      maxPoolSize: 10, // Maximum number of concurrent connections to MongoDB
      minPoolSize: 2, // Minimum warm connections ready for immediate use
      serverSelectionTimeoutMS: 10000, // Timeout for selecting MongoDB server
      socketTimeoutMS: 45000, // Timeout for socket operations
    })
    .then((mongooseInstance) => {
      // Cache the successful connection for future use
      cached.conn = mongooseInstance;

      return mongooseInstance;
    })
    .catch((error) => {
      // Clear the pending promise on failure to allow retry on next call
      cached.promise = null;
      throw error;
    });

  return cached.promise;
}

/**
 * Gracefully disconnects from MongoDB and clears cached connection.
 *
 * Closes the connection pool and resets both the connection instance and
 * pending promise, allowing a fresh connection on the next `connectDB()` call.
 * Safe to call even if no connection exists.
 *
 * Typically used for:
 * - Application shutdown procedures
 * - Testing cleanup
 * - Manual connection reset
 *
 * @async
 * @returns {Promise<void>} Resolves when disconnection is complete
 *
 * @example
 * // Cleanup before process exit
 * process.on('SIGTERM', async () => {
 *   await disconnectDB();
 *   process.exit(0);
 * });
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
  }
  cached.promise = null;
}

/**
 * Retrieves the current status of the MongoDB connection.
 *
 * Returns connection state based on cache values:
 * - `isConnected`: True if an active connection is established and cached
 * - `isConnecting`: True if connection is in progress (promise pending but conn not cached yet)
 *
 * Useful for:
 * - Health checks
 * - Debugging connection issues
 * - Determining readiness of database operations
 *
 * @returns {Object} Connection status object
 * @returns {boolean} isConnected - True if connected to MongoDB
 * @returns {boolean} isConnecting - True if connection attempt is in progress
 *
 * @example
 * const status = getConnectionStatus();
 * if (status.isConnected) {
 *   console.log('Database is ready');
 * } else if (status.isConnecting) {
 *   console.log('Connecting to database...');
 * }
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
