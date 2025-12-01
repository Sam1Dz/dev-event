import 'server-only';

import type mongoose from 'mongoose';

export interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

export type MongoEntityId = mongoose.Types.ObjectId;

declare global {
  var mongoose: MongooseConnection | undefined;
}
