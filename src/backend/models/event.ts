import 'server-only';

import dayjs from 'dayjs';
import mongoose, { Schema, type Model } from 'mongoose';

import type { EventModels } from '@/core/types/event';

/** Event schema defining MongoDB document structure and validation rules */
const EventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Time must be in HH:MM format',
      ],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be one of: online, offline, hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: function (agenda: string[]) {
          return agenda.length > 0;
        },
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: function (tags: string[]) {
          return tags.length > 0;
        },
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true,
  },
);

// Compound index ensures slug uniqueness and enables fast lookups
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook: Auto-generates URL-friendly slug and normalizes date/time formats
 */
EventSchema.pre<EventModels>('save', async function () {
  // Auto-generate slug from title if new document or title modified
  if (this.isNew || this.isModified('title')) {
    // Sanitize title: lowercase, remove special chars, replace spaces with hyphens
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    let slug = baseSlug;
    let counter = 1;

    // Append counter if slug already exists (ensures uniqueness)
    while (await mongoose.models.Event?.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Normalize date to ISO format (YYYY-MM-DD) for consistent storage and queries
  if (this.isNew || this.isModified('date')) {
    try {
      const dateObj = dayjs(this.date);

      if (!dateObj.isValid()) {
        throw new Error('Invalid date format');
      }
      this.date = dateObj.toISOString();
    } catch {
      throw new Error('Date must be a valid date');
    }
  }

  // Normalize time to padded HH:MM format (e.g., "09:30" instead of "9:30")
  if (this.isNew || this.isModified('time')) {
    try {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (!timeRegex.test(this.time)) {
        throw new Error('Invalid time format');
      }

      const [hours, minutes] = this.time.split(':');

      this.time = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch {
      throw new Error('Time must be in HH:MM format');
    }
  }
});

/** Mongoose model instance for Event documents */
const Event: Model<EventModels> =
  mongoose.models.Event || mongoose.model<EventModels>('Event', EventSchema);

export default Event;
