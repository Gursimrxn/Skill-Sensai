import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformMessage extends Document {
  title: string;
  content: string;
  type: 'announcement' | 'maintenance' | 'feature' | 'warning';
  targetUsers: 'all' | 'active' | 'new';
  status: 'draft' | 'sent';
  sentAt?: Date;
  sentBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformMessageSchema = new Schema<IPlatformMessage>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['announcement', 'maintenance', 'feature', 'warning'],
    default: 'announcement',
  },
  targetUsers: {
    type: String,
    enum: ['all', 'active', 'new'],
    default: 'all',
  },
  status: {
    type: String,
    enum: ['draft', 'sent'],
    default: 'draft',
  },
  sentAt: {
    type: Date,
  },
  sentBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const PlatformMessage = mongoose.models.PlatformMessage || mongoose.model<IPlatformMessage>('PlatformMessage', PlatformMessageSchema);
