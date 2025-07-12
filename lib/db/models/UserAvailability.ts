import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAvailability extends Document {
  userId: mongoose.Types.ObjectId;
  availableSlots: {
    date: Date;
    timeSlot: string; // e.g., "09:00-10:00"
    isBooked: boolean;
    bookedBy?: mongoose.Types.ObjectId;
    connectionId?: mongoose.Types.ObjectId;
    notes?: string;
  }[];
  timezone: string;
  recurringAvailability: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    timeSlots: string[];
    isActive: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserAvailabilitySchema = new Schema<IUserAvailability>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  availableSlots: [{
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    connectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Connection',
    },
    notes: {
      type: String,
      maxlength: 200,
    }
  }],
  timezone: {
    type: String,
    required: true,
    default: 'UTC',
  },
  recurringAvailability: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true,
    },
    timeSlots: [{
      type: String,
      required: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    }
  }],
}, {
  timestamps: true,
});

// Index for efficient querying
UserAvailabilitySchema.index({ userId: 1 });
UserAvailabilitySchema.index({ 'availableSlots.date': 1, 'availableSlots.isBooked': 1 });

export const UserAvailability = mongoose.models.UserAvailability || mongoose.model<IUserAvailability>('UserAvailability', UserAvailabilitySchema);
