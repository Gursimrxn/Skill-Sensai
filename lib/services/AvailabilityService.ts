import { UserAvailabilityRepository } from '../db/repositories/UserAvailabilityRepository';
import { IUserAvailability } from '../db/models/UserAvailability';

export class AvailabilityService {
  constructor(private availabilityRepository: UserAvailabilityRepository) {}

  async getUserAvailability(userId: string): Promise<IUserAvailability | null> {
    return await this.availabilityRepository.findByUserId(userId);
  }

  async setUserAvailability(userId: string, availabilityData: {
    timezone: string;
    recurringAvailability?: {
      dayOfWeek: number;
      timeSlots: string[];
      isActive: boolean;
    }[];
    availableSlots?: {
      date: Date;
      timeSlot: string;
      isBooked: boolean;
      notes?: string;
    }[];
  }): Promise<IUserAvailability> {
    return await this.availabilityRepository.createOrUpdateUserAvailability(userId, availabilityData);
  }

  async addAvailableSlots(userId: string, slots: {
    date: Date;
    timeSlot: string;
    notes?: string;
  }[]): Promise<IUserAvailability | null> {
    // Validate that slots are in the future
    const now = new Date();
    const validSlots = slots.filter(slot => slot.date > now);
    
    if (validSlots.length === 0) {
      throw new Error('All provided slots are in the past');
    }

    return await this.availabilityRepository.addAvailableSlots(userId, validSlots);
  }

  async removeAvailableSlot(userId: string, date: Date, timeSlot: string): Promise<boolean> {
    // Check if the slot is booked
    const availability = await this.availabilityRepository.findByUserId(userId);
    
    if (!availability) {
      throw new Error('User availability not found');
    }

    const slot = availability.availableSlots.find((s: any) => 
      s.date.toDateString() === date.toDateString() && 
      s.timeSlot === timeSlot
    );

    if (slot && slot.isBooked) {
      throw new Error('Cannot remove a booked time slot');
    }

    return await this.availabilityRepository.removeAvailableSlot(userId, date, timeSlot);
  }

  async getAvailableSlots(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // Validate date range
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    // Limit to reasonable date range (e.g., 3 months)
    const maxRange = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    if (endDate.getTime() - startDate.getTime() > maxRange) {
      throw new Error('Date range too large. Maximum 90 days allowed');
    }

    return await this.availabilityRepository.getAvailableSlots(userId, startDate, endDate);
  }

  async setRecurringAvailability(userId: string, recurringSlots: {
    dayOfWeek: number;
    timeSlots: string[];
    isActive: boolean;
  }[]): Promise<IUserAvailability | null> {
    // Validate day of week values
    const validDays = recurringSlots.filter(slot => 
      slot.dayOfWeek >= 0 && slot.dayOfWeek <= 6
    );

    if (validDays.length !== recurringSlots.length) {
      throw new Error('Invalid day of week values. Must be 0-6 (Sunday-Saturday)');
    }

    return await this.availabilityRepository.setRecurringAvailability(userId, recurringSlots);
  }

  async generateSlotsFromRecurring(userId: string, startDate: Date, endDate: Date): Promise<IUserAvailability | null> {
    // Validate date range
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    // Don't generate slots for past dates
    const now = new Date();
    const effectiveStartDate = startDate < now ? now : startDate;

    return await this.availabilityRepository.generateSlotsFromRecurring(userId, effectiveStartDate, endDate);
  }

  async getUserBookedSlots(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const availability = await this.availabilityRepository.findByUserId(userId);
    
    if (!availability) {
      return [];
    }

    return availability.availableSlots.filter((slot: any) => 
      slot.date >= startDate && 
      slot.date <= endDate && 
      slot.isBooked
    );
  }

  async isSlotAvailable(userId: string, date: Date, timeSlot: string): Promise<boolean> {
    const availability = await this.availabilityRepository.findByUserId(userId);
    
    if (!availability) {
      return false;
    }

    const slot = availability.availableSlots.find((s: any) => 
      s.date.toDateString() === date.toDateString() && 
      s.timeSlot === timeSlot
    );

    return slot ? !slot.isBooked : false;
  }

  async getCommonAvailability(userId1: string, userId2: string, startDate: Date, endDate: Date): Promise<any[]> {
    const [user1Slots, user2Slots] = await Promise.all([
      this.getAvailableSlots(userId1, startDate, endDate),
      this.getAvailableSlots(userId2, startDate, endDate)
    ]);

    // Find overlapping slots
    const commonSlots = user1Slots.filter(slot1 => 
      user2Slots.some(slot2 => 
        slot1.date.toDateString() === slot2.date.toDateString() && 
        slot1.timeSlot === slot2.timeSlot
      )
    );

    return commonSlots;
  }

  async bulkGenerateSlots(userId: string, config: {
    startDate: Date;
    endDate: Date;
    daysOfWeek: number[];
    timeSlots: string[];
    excludeDates?: Date[];
  }): Promise<IUserAvailability | null> {
    const { startDate, endDate, daysOfWeek, timeSlots, excludeDates = [] } = config;
    
    const slots: { date: Date; timeSlot: string; }[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (daysOfWeek.includes(dayOfWeek)) {
        const isExcluded = excludeDates.some(excludeDate => 
          excludeDate.toDateString() === currentDate.toDateString()
        );
        
        if (!isExcluded) {
          timeSlots.forEach(timeSlot => {
            slots.push({
              date: new Date(currentDate),
              timeSlot
            });
          });
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (slots.length === 0) {
      throw new Error('No valid slots generated with the provided configuration');
    }

    return await this.availabilityRepository.addAvailableSlots(userId, slots);
  }
}
