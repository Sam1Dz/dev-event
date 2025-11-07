import type { Schema } from 'mongoose';

import mongoose from 'mongoose';

import type { MongoBaseDocument } from '@/types/mongodb';

export interface EventModel extends MongoBaseDocument {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

const eventSchema: Schema<EventModel> = new mongoose.Schema<EventModel>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    overview: {
      type: String,
      required: [true, 'Event overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Event image URL is required'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    mode: {
      type: String,
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be one of: online, offline, or hybrid',
      },
      required: [true, 'Event mode is required'],
    },
    audience: {
      type: String,
      required: [true, 'Event audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Event agenda is required'],
      validate: {
        validator(value: string[]): boolean {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Event organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Event tags are required'],
      validate: {
        validator(value: string[]): boolean {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'Tags must contain at least one item',
      },
    },
  },
  { timestamps: true },
);

// Generate URL-friendly slug from title. Only regenerate if title changes.
eventSchema.pre('save', async function (next) {
  if (!this.isModified('title') && this.slug) {
    return next();
  }

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100);
  };

  this.slug = generateSlug(this.title);

  // Check if slug already exists (excluding current document if updating)
  const existingEvent = await mongoose.model<EventModel>('Event').findOne({
    slug: this.slug,
    _id: { $ne: this._id },
  });

  if (existingEvent) {
    const timestamp = Date.now();

    this.slug = `${this.slug}-${timestamp}`;
  }

  next();
});

// Normalize date to ISO format and validate time format
eventSchema.pre('save', function (next) {
  if (this.isModified('date')) {
    const parsedDate = new Date(this.date);

    if (Number.isNaN(parsedDate.getTime())) {
      return next(new Error('Invalid date format'));
    }

    this.date = parsedDate.toISOString().split('T')[0];
  }

  // Validate time format (HH:MM or HH:MM:SS)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

  if (!timeRegex.test(this.time)) {
    return next(new Error('Time must be in HH:MM or HH:MM:SS format'));
  }

  next();
});

export const Event =
  mongoose.models.Event || mongoose.model<EventModel>('Event', eventSchema);
