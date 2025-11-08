import type { Document, Mongoose } from 'mongoose';

/**
 * Base document interface for all MongoDB documents.
 * Extends Mongoose Document with common timestamp and ID fields.
 */
export interface MongoBaseDocument extends Document {
  /** MongoDB document ID */
  _id: string;
  /** Document creation timestamp */
  createdAt: Date;
  /** Document last update timestamp */
  updatedAt: Date;
}

/**
 * Generic Mongoose model type combining Document and base interface properties.
 * Used for typed Mongoose models that extend MongoBaseDocument.
 * @template T - The document interface type extending MongoBaseDocument
 */
export type MongooseModel<T extends MongoBaseDocument> = Document & T;

/**
 * MongoDB connection state interface for caching Mongoose instances.
 * Enables reuse of connection across serverless functions.
 */
export interface MongoConnection {
  /** Active Mongoose connection instance or null if not connected */
  conn: Mongoose | null;
  /** Pending connection promise or null if not in progress */
  promise: Promise<Mongoose> | null;
}
