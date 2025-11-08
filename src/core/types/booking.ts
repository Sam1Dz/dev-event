import type { Document } from 'mongoose';
import type { MongoEntityId } from './mongodb';

/* MODELS */
export interface BookingModels extends Document {
  eventId: MongoEntityId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
