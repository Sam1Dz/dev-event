import type { Schema } from 'mongoose';

import mongoose from 'mongoose';

import type { MongoBaseDocument } from '@/types/mongodb';

export interface BookingModel extends MongoBaseDocument {
  eventId: mongoose.Types.ObjectId;
  email: string;
}

const bookingSchema: Schema<BookingModel> = new mongoose.Schema<BookingModel>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
  },
  { timestamps: true },
);

// Verify that the referenced event exists before saving
bookingSchema.pre('save', async function (next) {
  const Event = mongoose.model('Event');

  const eventExists = await Event.findById(this.eventId);

  if (!eventExists) {
    return next(new Error(`Event with ID ${this.eventId} does not exist`));
  }

  next();
});

export const Booking =
  mongoose.models.Booking ||
  mongoose.model<BookingModel>('Booking', bookingSchema);
