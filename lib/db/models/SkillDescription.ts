import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface ISkillDescription extends Document {
  userId: ObjectId;
  skill: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  reportCount: number;
  reports: Array<{
    reporterId: ObjectId;
    reason: string;
    reportedAt: Date;
  }>;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillDescriptionSchema = new Schema<ISkillDescription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skill: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reportCount: {
    type: Number,
    default: 0,
  },
  reports: [{
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
SkillDescriptionSchema.index({ status: 1, createdAt: -1 });
SkillDescriptionSchema.index({ userId: 1 });

export const SkillDescription = mongoose.models.SkillDescription || mongoose.model<ISkillDescription>('SkillDescription', SkillDescriptionSchema);
