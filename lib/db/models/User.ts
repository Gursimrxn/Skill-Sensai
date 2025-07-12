import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  provider: string;
  providerId: string;
  onboardingCompleted: boolean;
  skills?: string[];
  skillsToLearn?: string[];
  swapGoals?: string[];
  resumeUrl?: string;
  level: number;
  availability?: {
    days: string[];
    timeSlots: string[];
    timezone: string;
  };
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  provider: {
    type: String,
    required: true,
  },
  providerId: {
    type: String,
    required: true,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  skills: [{
    type: String,
  }],
  skillsToLearn: [{
    type: String,
  }],
  swapGoals: [{
    type: String,
  }],
  resumeUrl: {
    type: String,
  },
  level: {
    type: Number,
    default: 1,
  },
  availability: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeSlots: [{
      type: String,
    }],
    timezone: {
      type: String,
    }
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: {
    type: String,
  },
  bannedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
