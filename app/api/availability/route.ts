import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/authOptions';
import connectDB from '../../../lib/db/connection';
import { User } from '../../../lib/db/models/User';
import { UserAvailabilityRepository } from '../../../lib/db/repositories/UserAvailabilityRepository';
import { AvailabilityService } from '../../../lib/services/AvailabilityService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type'); // 'available', 'booked', or 'all'

    const availabilityRepository = new UserAvailabilityRepository();
    const availabilityService = new AvailabilityService(availabilityRepository);

    const userAvailability = await availabilityService.getUserAvailability(currentUser._id.toString());

    if (!userAvailability) {
      return NextResponse.json({
        availability: null,
        slots: [],
        recurringAvailability: []
      });
    }

    let slots = [];

    if (startDate && endDate) {
      switch (type) {
        case 'available':
          slots = await availabilityService.getAvailableSlots(
            currentUser._id.toString(),
            new Date(startDate),
            new Date(endDate)
          );
          break;
        case 'booked':
          slots = await availabilityService.getUserBookedSlots(
            currentUser._id.toString(),
            new Date(startDate),
            new Date(endDate)
          );
          break;
        default:
          // Get all slots
          const allSlots = userAvailability.availableSlots.filter((slot: any) => {
            const slotDate = new Date(slot.date);
            return slotDate >= new Date(startDate) && slotDate <= new Date(endDate);
          });
          slots = allSlots;
      }
    }

    return NextResponse.json({
      availability: {
        id: userAvailability._id,
        userId: userAvailability.userId,
        timezone: userAvailability.timezone,
        recurringAvailability: userAvailability.recurringAvailability
      },
      slots: slots.map((slot: any) => ({
        date: slot.date,
        timeSlot: slot.timeSlot,
        isBooked: slot.isBooked,
        bookedBy: slot.bookedBy,
        connectionId: slot.connectionId,
        notes: slot.notes
      })),
      total: slots.length
    });

  } catch (error: any) {
    console.error('Error fetching user availability:', error);
    
    if (error.message.includes('Date range too large') || 
        error.message.includes('Start date must be before end date')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, timezone, recurringAvailability, availableSlots, bulkConfig } = body;

    const availabilityRepository = new UserAvailabilityRepository();
    const availabilityService = new AvailabilityService(availabilityRepository);

    let result;

    switch (action) {
      case 'setRecurring':
        if (!recurringAvailability || !timezone) {
          return NextResponse.json(
            { error: 'recurringAvailability and timezone are required for setRecurring action' },
            { status: 400 }
          );
        }
        result = await availabilityService.setRecurringAvailability(
          currentUser._id.toString(),
          recurringAvailability
        );
        break;

      case 'addSlots':
        if (!availableSlots || !Array.isArray(availableSlots)) {
          return NextResponse.json(
            { error: 'availableSlots array is required for addSlots action' },
            { status: 400 }
          );
        }
        result = await availabilityService.addAvailableSlots(
          currentUser._id.toString(),
          availableSlots.map((slot: any) => ({
            date: new Date(slot.date),
            timeSlot: slot.timeSlot,
            notes: slot.notes
          }))
        );
        break;

      case 'generateFromRecurring':
        const { startDate, endDate } = body;
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate are required for generateFromRecurring action' },
            { status: 400 }
          );
        }
        result = await availabilityService.generateSlotsFromRecurring(
          currentUser._id.toString(),
          new Date(startDate),
          new Date(endDate)
        );
        break;

      case 'bulkGenerate':
        if (!bulkConfig) {
          return NextResponse.json(
            { error: 'bulkConfig is required for bulkGenerate action' },
            { status: 400 }
          );
        }
        result = await availabilityService.bulkGenerateSlots(
          currentUser._id.toString(),
          {
            ...bulkConfig,
            startDate: new Date(bulkConfig.startDate),
            endDate: new Date(bulkConfig.endDate),
            excludeDates: bulkConfig.excludeDates?.map((date: string) => new Date(date)) || []
          }
        );
        break;

      case 'setAvailability':
        if (!timezone) {
          return NextResponse.json(
            { error: 'timezone is required for setAvailability action' },
            { status: 400 }
          );
        }
        result = await availabilityService.setUserAvailability(currentUser._id.toString(), {
          timezone,
          recurringAvailability: recurringAvailability || [],
          availableSlots: availableSlots?.map((slot: any) => ({
            date: new Date(slot.date),
            timeSlot: slot.timeSlot,
            isBooked: false,
            notes: slot.notes
          })) || []
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      availability: {
        id: result?._id,
        userId: result?.userId,
        timezone: result?.timezone,
        recurringAvailability: result?.recurringAvailability,
        totalSlots: result?.availableSlots?.length || 0
      },
      message: `Availability ${action} completed successfully`
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error managing availability:', error);
    
    if (error.message.includes('Invalid day of week') || 
        error.message.includes('All provided slots are in the past') ||
        error.message.includes('Date range too large') ||
        error.message.includes('No valid slots generated')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const timeSlot = searchParams.get('timeSlot');

    if (!date || !timeSlot) {
      return NextResponse.json(
        { error: 'date and timeSlot are required' },
        { status: 400 }
      );
    }

    const availabilityRepository = new UserAvailabilityRepository();
    const availabilityService = new AvailabilityService(availabilityRepository);

    const success = await availabilityService.removeAvailableSlot(
      currentUser._id.toString(),
      new Date(date),
      timeSlot
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove slot or slot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Slot removed successfully' });

  } catch (error: any) {
    console.error('Error removing availability slot:', error);
    
    if (error.message.includes('Cannot remove a booked time slot') ||
        error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
