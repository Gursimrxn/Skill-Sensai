import mongoose, { Schema, Document } from 'mongoose';

export interface IConnection extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  connectionType: 'skill-swap' | 'mentorship' | 'collaboration';
  message?: string;
  skillsOffered: string[];
  skillsRequested: string[];
  scheduledSlots?: {
    date: Date;
    timeSlot: string;
    duration: number; // in minutes
    status: 'scheduled' | 'completed' | 'cancelled';
    meetingLink?: string;
    notes?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>({
  requester: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending',
  },
  connectionType: {
    type: String,
    enum: ['skill-swap', 'mentorship', 'collaboration'],
    required: true,
  },
  message: {
    type: String,
    maxlength: 500,
  },
  skillsOffered: [{
    type: String,
    required: true,
  }],
  skillsRequested: [{
    type: String,
    required: true,
  }],
  scheduledSlots: [{
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 60, // 60 minutes default
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    meetingLink: {
      type: String,
    },
    notes: {
      type: String,
      maxlength: 1000,
    }
  }],
}, {
  timestamps: true,
});

// Compound index to prevent duplicate connections
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Connection = mongoose.models.Connection || mongoose.model<IConnection>('Connection', ConnectionSchema);
