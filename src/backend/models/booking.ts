import 'server-only';

import mongoose, { Schema, type Model } from 'mongoose';

import type { BookingModels } from '@/core/types/booking';

/** Booking schema linking events to attendee email addresses */
const BookingSchema: Schema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          // RFC-based email validation: basic check for local@domain.ext format
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: 'Please enter a valid email address',
      },
    },
  },
  {
    timestamps: true,
  },
);

// Index on eventId for efficient queries filtering bookings by event
BookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook: Validates referential integrity by ensuring referenced event exists
 */
BookingSchema.pre<BookingModels>('save', async function () {
  const Event = mongoose.model('Event');
  const eventExists = await Event.exists({ _id: this.eventId });

  // Prevent orphaned bookings pointing to non-existent events
  if (!eventExists) {
    throw new Error('Referenced event does not exist');
  }
});

/** Mongoose model instance for Booking documents */
const Booking: Model<BookingModels> =
  mongoose.models.Booking ||
  mongoose.model<BookingModels>('Booking', BookingSchema);

export default Booking;
