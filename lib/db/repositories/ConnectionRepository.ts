import { IRepository } from '../../core/types';
import { Connection, IConnection } from '../models/Connection';
import connectDB from '../connection';
import mongoose from 'mongoose';

export class ConnectionRepository implements IRepository<IConnection> {
  private async ensureConnection() {
    await connectDB();
  }

  async create(connectionData: Partial<IConnection>): Promise<IConnection> {
    await this.ensureConnection();
    const connection = new Connection(connectionData);
    return await connection.save();
  }

  async findById(id: string): Promise<IConnection | null> {
    await this.ensureConnection();
    return await Connection.findById(id)
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level');
  }

  async findOne(filter: Record<string, unknown>): Promise<IConnection | null> {
    await this.ensureConnection();
    return await Connection.findOne(filter)
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level');
  }

  async findMany(filter: Record<string, unknown>): Promise<IConnection[]> {
    await this.ensureConnection();
    return await Connection.find(filter)
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level')
      .sort({ createdAt: -1 });
  }

  async update(id: string, data: Partial<IConnection>): Promise<IConnection | null> {
    await this.ensureConnection();
    return await Connection.findByIdAndUpdate(id, data, { new: true })
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level');
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await Connection.findByIdAndDelete(id);
    return !!result;
  }

  // Custom methods for connection management
  async findUserConnections(userId: string, status?: string): Promise<IConnection[]> {
    await this.ensureConnection();
    const filter: any = {
      $or: [
        { requester: new mongoose.Types.ObjectId(userId) },
        { recipient: new mongoose.Types.ObjectId(userId) }
      ]
    };
    
    if (status) {
      filter.status = status;
    }

    return await Connection.find(filter)
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level')
      .sort({ createdAt: -1 });
  }

  async findPendingRequests(userId: string): Promise<IConnection[]> {
    await this.ensureConnection();
    return await Connection.find({
      recipient: new mongoose.Types.ObjectId(userId),
      status: 'pending'
    })
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level')
      .sort({ createdAt: -1 });
  }

  async findSentRequests(userId: string): Promise<IConnection[]> {
    await this.ensureConnection();
    return await Connection.find({
      requester: new mongoose.Types.ObjectId(userId),
      status: 'pending'
    })
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level')
      .sort({ createdAt: -1 });
  }

  async checkExistingConnection(requesterId: string, recipientId: string): Promise<IConnection | null> {
    await this.ensureConnection();
    return await Connection.findOne({
      $or: [
        { requester: new mongoose.Types.ObjectId(requesterId), recipient: new mongoose.Types.ObjectId(recipientId) },
        { requester: new mongoose.Types.ObjectId(recipientId), recipient: new mongoose.Types.ObjectId(requesterId) }
      ]
    });
  }

  async acceptConnection(connectionId: string): Promise<IConnection | null> {
    await this.ensureConnection();
    return await Connection.findByIdAndUpdate(
      connectionId,
      { status: 'accepted' },
      { new: true }
    )
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level');
  }

  async declineConnection(connectionId: string): Promise<IConnection | null> {
    await this.ensureConnection();
    return await Connection.findByIdAndUpdate(
      connectionId,
      { status: 'declined' },
      { new: true }
    )
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level');
  }

  async addScheduledSlot(connectionId: string, slotData: {
    date: Date;
    timeSlot: string;
    duration?: number;
    meetingLink?: string;
    notes?: string;
  }): Promise<IConnection | null> {
    await this.ensureConnection();
    return await Connection.findByIdAndUpdate(
      connectionId,
      {
        $push: {
          scheduledSlots: {
            ...slotData,
            status: 'scheduled'
          }
        }
      },
      { new: true }
    )
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level');
  }

  async updateScheduledSlot(connectionId: string, slotIndex: number, updateData: {
    status?: 'scheduled' | 'completed' | 'cancelled';
    meetingLink?: string;
    notes?: string;
  }): Promise<IConnection | null> {
    await this.ensureConnection();
    const updateFields: any = {};
    
    Object.keys(updateData).forEach(key => {
      updateFields[`scheduledSlots.${slotIndex}.${key}`] = updateData[key as keyof typeof updateData];
    });

    return await Connection.findByIdAndUpdate(
      connectionId,
      { $set: updateFields },
      { new: true }
    )
      .populate('requester', 'name email image skills level')
      .populate('recipient', 'name email image skills level');
  }
}
