import { IRepository } from '../../core/types';
import { UserAvailability, IUserAvailability } from '../models/UserAvailability';
import connectDB from '../connection';
import mongoose from 'mongoose';

export class UserAvailabilityRepository implements IRepository<IUserAvailability> {
  private async ensureConnection() {
    await connectDB();
  }

  async create(availabilityData: Partial<IUserAvailability>): Promise<IUserAvailability> {
    await this.ensureConnection();
    const availability = new UserAvailability(availabilityData);
    return await availability.save();
  }

  async findById(id: string): Promise<IUserAvailability | null> {
    await this.ensureConnection();
    return await UserAvailability.findById(id).populate('userId', 'name email');
  }

  async findOne(filter: Record<string, unknown>): Promise<IUserAvailability | null> {
    await this.ensureConnection();
    return await UserAvailability.findOne(filter).populate('userId', 'name email');
  }

  async findMany(filter: Record<string, unknown>): Promise<IUserAvailability[]> {
    await this.ensureConnection();
    return await UserAvailability.find(filter).populate('userId', 'name email');
  }

  async update(id: string, data: Partial<IUserAvailability>): Promise<IUserAvailability | null> {
    await this.ensureConnection();
    return await UserAvailability.findByIdAndUpdate(id, data, { new: true }).populate('userId', 'name email');
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await UserAvailability.findByIdAndDelete(id);
    return !!result;
  }

  // Custom methods for availability management
  async findByUserId(userId: string): Promise<IUserAvailability | null> {
    await this.ensureConnection();
    return await UserAvailability.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('userId', 'name email');
  }

  async createOrUpdateUserAvailability(userId: string, availabilityData: Partial<IUserAvailability>): Promise<IUserAvailability> {
    await this.ensureConnection();
    return await UserAvailability.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { ...availabilityData, userId: new mongoose.Types.ObjectId(userId) },
      { upsert: true, new: true }
    ).populate('userId', 'name email');
  }

  async getAvailableSlots(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    await this.ensureConnection();
    const availability = await UserAvailability.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!availability) return [];

    return availability.availableSlots.filter((slot: any) => 
      slot.date >= startDate && 
      slot.date <= endDate && 
      !slot.isBooked
    );
  }

  async bookTimeSlot(userId: string, date: Date, timeSlot: string, bookedBy: string, connectionId: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await UserAvailability.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        'availableSlots.date': date,
        'availableSlots.timeSlot': timeSlot,
        'availableSlots.isBooked': false
      },
      {
        $set: {
          'availableSlots.$.isBooked': true,
          'availableSlots.$.bookedBy': new mongoose.Types.ObjectId(bookedBy),
          'availableSlots.$.connectionId': new mongoose.Types.ObjectId(connectionId)
        }
      }
    );

    return result.modifiedCount > 0;
  }

  async unbookTimeSlot(userId: string, date: Date, timeSlot: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await UserAvailability.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        'availableSlots.date': date,
        'availableSlots.timeSlot': timeSlot
      },
      {
        $set: {
          'availableSlots.$.isBooked': false,
        },
        $unset: {
          'availableSlots.$.bookedBy': '',
          'availableSlots.$.connectionId': ''
        }
      }
    );

    return result.modifiedCount > 0;
  }

  async addAvailableSlots(userId: string, slots: {
    date: Date;
    timeSlot: string;
    notes?: string;
  }[]): Promise<IUserAvailability | null> {
    await this.ensureConnection();
    return await UserAvailability.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        $push: {
          availableSlots: {
            $each: slots.map(slot => ({
              ...slot,
              isBooked: false
            }))
          }
        }
      },
      { upsert: true, new: true }
    ).populate('userId', 'name email');
  }

  async removeAvailableSlot(userId: string, date: Date, timeSlot: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await UserAvailability.updateOne(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        $pull: {
          availableSlots: {
            date: date,
            timeSlot: timeSlot
          }
        }
      }
    );

    return result.modifiedCount > 0;
  }

  async setRecurringAvailability(userId: string, recurringSlots: {
    dayOfWeek: number;
    timeSlots: string[];
    isActive: boolean;
  }[]): Promise<IUserAvailability | null> {
    await this.ensureConnection();
    return await UserAvailability.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { 
        $set: { recurringAvailability: recurringSlots }
      },
      { upsert: true, new: true }
    ).populate('userId', 'name email');
  }

  async generateSlotsFromRecurring(userId: string, startDate: Date, endDate: Date): Promise<IUserAvailability | null> {
    await this.ensureConnection();
    const availability = await UserAvailability.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!availability || !availability.recurringAvailability.length) {
      return availability;
    }

    const newSlots: any[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const recurringForDay = availability.recurringAvailability.find((r: any) => r.dayOfWeek === dayOfWeek && r.isActive);
      
      if (recurringForDay) {
        recurringForDay.timeSlots.forEach((timeSlot: any) => {
          // Check if slot already exists
          const existingSlot = availability.availableSlots.find((slot: any) => 
            slot.date.toDateString() === currentDate.toDateString() && 
            slot.timeSlot === timeSlot
          );
          
          if (!existingSlot) {
            newSlots.push({
              date: new Date(currentDate),
              timeSlot,
              isBooked: false
            });
          }
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (newSlots.length > 0) {
      return await UserAvailability.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        {
          $push: {
            availableSlots: { $each: newSlots }
          }
        },
        { new: true }
      ).populate('userId', 'name email');
    }

    return availability;
  }
}
