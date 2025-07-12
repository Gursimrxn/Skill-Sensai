import { ConnectionRepository } from '../db/repositories/ConnectionRepository';
import { UserAvailabilityRepository } from '../db/repositories/UserAvailabilityRepository';
import { IConnection } from '../db/models/Connection';
import mongoose from 'mongoose';

export class ConnectionService {
  constructor(
    private connectionRepository: ConnectionRepository,
    private availabilityRepository: UserAvailabilityRepository
  ) {}

  async createConnectionRequest(requestData: {
    requesterId: string;
    recipientId: string;
    connectionType: 'skill-swap' | 'mentorship' | 'collaboration';
    message?: string;
    skillsOffered: string[];
    skillsRequested: string[];
  }): Promise<IConnection> {
    // Check if connection already exists
    const existingConnection = await this.connectionRepository.checkExistingConnection(
      requestData.requesterId,
      requestData.recipientId
    );

    if (existingConnection) {
      throw new Error('Connection already exists between these users');
    }

    // Prevent self-connection
    if (requestData.requesterId === requestData.recipientId) {
      throw new Error('Cannot connect to yourself');
    }

    return await this.connectionRepository.create({
      requester: new mongoose.Types.ObjectId(requestData.requesterId),
      recipient: new mongoose.Types.ObjectId(requestData.recipientId),
      connectionType: requestData.connectionType,
      message: requestData.message,
      skillsOffered: requestData.skillsOffered,
      skillsRequested: requestData.skillsRequested,
      status: 'pending',
      scheduledSlots: []
    });
  }

  async acceptConnection(connectionId: string, userId: string): Promise<IConnection> {
    const connection = await this.connectionRepository.findById(connectionId);
    
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Only recipient can accept
    if (connection.recipient._id.toString() !== userId) {
      throw new Error('Only the recipient can accept this connection');
    }

    if (connection.status !== 'pending') {
      throw new Error('Connection is not in pending status');
    }

    const updatedConnection = await this.connectionRepository.acceptConnection(connectionId);
    if (!updatedConnection) {
      throw new Error('Failed to accept connection');
    }

    return updatedConnection;
  }

  async declineConnection(connectionId: string, userId: string): Promise<IConnection> {
    const connection = await this.connectionRepository.findById(connectionId);
    
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Only recipient can decline
    if (connection.recipient._id.toString() !== userId) {
      throw new Error('Only the recipient can decline this connection');
    }

    if (connection.status !== 'pending') {
      throw new Error('Connection is not in pending status');
    }

    const updatedConnection = await this.connectionRepository.declineConnection(connectionId);
    if (!updatedConnection) {
      throw new Error('Failed to decline connection');
    }

    return updatedConnection;
  }

  async cancelConnection(connectionId: string, userId: string): Promise<IConnection> {
    const connection = await this.connectionRepository.findById(connectionId);
    
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Only requester or recipient can cancel
    const isRequester = connection.requester._id.toString() === userId;
    const isRecipient = connection.recipient._id.toString() === userId;
    
    if (!isRequester && !isRecipient) {
      throw new Error('Not authorized to cancel this connection');
    }

    // Cancel any scheduled slots and free up availability
    if (connection.scheduledSlots && connection.scheduledSlots.length > 0) {
      for (const slot of connection.scheduledSlots) {
        if (slot.status === 'scheduled') {
          // Free up availability for both users
          await this.availabilityRepository.unbookTimeSlot(
            connection.requester._id.toString(),
            slot.date,
            slot.timeSlot
          );
          await this.availabilityRepository.unbookTimeSlot(
            connection.recipient._id.toString(),
            slot.date,
            slot.timeSlot
          );
        }
      }
    }

    const updatedConnection = await this.connectionRepository.update(connectionId, { status: 'cancelled' });
    if (!updatedConnection) {
      throw new Error('Failed to cancel connection');
    }

    return updatedConnection;
  }

  async scheduleSession(
    connectionId: string,
    userId: string,
    sessionData: {
      date: Date;
      timeSlot: string;
      duration?: number;
      meetingLink?: string;
      notes?: string;
    }
  ): Promise<IConnection> {
    const connection = await this.connectionRepository.findById(connectionId);
    
    if (!connection) {
      throw new Error('Connection not found');
    }

    if (connection.status !== 'accepted') {
      throw new Error('Connection must be accepted before scheduling sessions');
    }

    // Check if user is part of this connection
    const isRequester = connection.requester._id.toString() === userId;
    const isRecipient = connection.recipient._id.toString() === userId;
    
    if (!isRequester && !isRecipient) {
      throw new Error('Not authorized to schedule for this connection');
    }

    const otherUserId = isRequester ? connection.recipient._id.toString() : connection.requester._id.toString();

    // Check if both users have this time slot available
    const userAvailability = await this.availabilityRepository.getAvailableSlots(
      userId,
      sessionData.date,
      sessionData.date
    );

    const otherUserAvailability = await this.availabilityRepository.getAvailableSlots(
      otherUserId,
      sessionData.date,
      sessionData.date
    );

    const userSlotAvailable = userAvailability.some(slot => 
      slot.timeSlot === sessionData.timeSlot && !slot.isBooked
    );

    const otherUserSlotAvailable = otherUserAvailability.some(slot => 
      slot.timeSlot === sessionData.timeSlot && !slot.isBooked
    );

    if (!userSlotAvailable || !otherUserSlotAvailable) {
      throw new Error('This time slot is not available for both users');
    }

    // Book the time slots for both users
    const userBooking = await this.availabilityRepository.bookTimeSlot(
      userId,
      sessionData.date,
      sessionData.timeSlot,
      otherUserId,
      connectionId
    );

    const otherUserBooking = await this.availabilityRepository.bookTimeSlot(
      otherUserId,
      sessionData.date,
      sessionData.timeSlot,
      userId,
      connectionId
    );

    if (!userBooking || !otherUserBooking) {
      // Rollback if either booking failed
      await this.availabilityRepository.unbookTimeSlot(userId, sessionData.date, sessionData.timeSlot);
      await this.availabilityRepository.unbookTimeSlot(otherUserId, sessionData.date, sessionData.timeSlot);
      throw new Error('Failed to book time slots');
    }

    // Add the scheduled slot to the connection
    const updatedConnection = await this.connectionRepository.addScheduledSlot(connectionId, sessionData);
    if (!updatedConnection) {
      // Rollback bookings
      await this.availabilityRepository.unbookTimeSlot(userId, sessionData.date, sessionData.timeSlot);
      await this.availabilityRepository.unbookTimeSlot(otherUserId, sessionData.date, sessionData.timeSlot);
      throw new Error('Failed to schedule session');
    }

    return updatedConnection;
  }

  async cancelSession(
    connectionId: string,
    slotIndex: number,
    userId: string
  ): Promise<IConnection> {
    const connection = await this.connectionRepository.findById(connectionId);
    
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Check if user is part of this connection
    const isRequester = connection.requester._id.toString() === userId;
    const isRecipient = connection.recipient._id.toString() === userId;
    
    if (!isRequester && !isRecipient) {
      throw new Error('Not authorized to cancel sessions for this connection');
    }

    if (!connection.scheduledSlots || !connection.scheduledSlots[slotIndex]) {
      throw new Error('Scheduled slot not found');
    }

    const slot = connection.scheduledSlots[slotIndex];
    
    if (slot.status !== 'scheduled') {
      throw new Error('Session is not in scheduled status');
    }

    const otherUserId = isRequester ? connection.recipient._id.toString() : connection.requester._id.toString();

    // Free up the time slots for both users
    await this.availabilityRepository.unbookTimeSlot(userId, slot.date, slot.timeSlot);
    await this.availabilityRepository.unbookTimeSlot(otherUserId, slot.date, slot.timeSlot);

    // Update the slot status
    const updatedConnection = await this.connectionRepository.updateScheduledSlot(
      connectionId,
      slotIndex,
      { status: 'cancelled' }
    );

    if (!updatedConnection) {
      throw new Error('Failed to cancel session');
    }

    return updatedConnection;
  }

  async completeSession(
    connectionId: string,
    slotIndex: number,
    userId: string,
    notes?: string
  ): Promise<IConnection> {
    const connection = await this.connectionRepository.findById(connectionId);
    
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Check if user is part of this connection
    const isRequester = connection.requester._id.toString() === userId;
    const isRecipient = connection.recipient._id.toString() === userId;
    
    if (!isRequester && !isRecipient) {
      throw new Error('Not authorized to complete sessions for this connection');
    }

    if (!connection.scheduledSlots || !connection.scheduledSlots[slotIndex]) {
      throw new Error('Scheduled slot not found');
    }

    const slot = connection.scheduledSlots[slotIndex];
    
    if (slot.status !== 'scheduled') {
      throw new Error('Session is not in scheduled status');
    }

    // Update the slot status
    const updatedConnection = await this.connectionRepository.updateScheduledSlot(
      connectionId,
      slotIndex,
      { status: 'completed', notes }
    );

    if (!updatedConnection) {
      throw new Error('Failed to complete session');
    }

    return updatedConnection;
  }

  async getUserConnections(userId: string, status?: string): Promise<IConnection[]> {
    return await this.connectionRepository.findUserConnections(userId, status);
  }

  async getPendingRequests(userId: string): Promise<IConnection[]> {
    return await this.connectionRepository.findPendingRequests(userId);
  }

  async getSentRequests(userId: string): Promise<IConnection[]> {
    return await this.connectionRepository.findSentRequests(userId);
  }
}
