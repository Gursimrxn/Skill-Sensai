import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboarding extends Document {
  userId: string;
  currentStep: number;
  steps: {
    welcome: {
      completed: boolean;
      skills?: string[];
      completedAt?: Date;
    };
    resume: {
      completed: boolean;
      resumeUrl?: string;
      completedAt?: Date;
    };
    levelAssignment: {
      completed: boolean;
      level?: number;
      completedAt?: Date;
    };
  };
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OnboardingSchema = new Schema<IOnboarding>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 3,
  },
  steps: {
    welcome: {
      completed: { type: Boolean, default: false },
      skills: [{ type: String }],
      completedAt: { type: Date },
    },
    resume: {
      completed: { type: Boolean, default: false },
      resumeUrl: { type: String },
      completedAt: { type: Date },
    },
    levelAssignment: {
      completed: { type: Boolean, default: false },
      level: { type: Number },
      completedAt: { type: Date },
    },
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export const Onboarding = mongoose.models.Onboarding || mongoose.model<IOnboarding>('Onboarding', OnboardingSchema);
