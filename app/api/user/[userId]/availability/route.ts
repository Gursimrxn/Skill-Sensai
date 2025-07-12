import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';
import connectDB from '../../../../../lib/db/connection';
import { User } from '../../../../../lib/db/models/User';
import { UserAvailabilityRepository } from '../../../../../lib/db/repositories/UserAvailabilityRepository';
import { AvailabilityService } from '../../../../../lib/services/AvailabilityService';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const availabilityRepository = new UserAvailabilityRepository();
    const availabilityService = new AvailabilityService(availabilityRepository);

    const availableSlots = await availabilityService.getAvailableSlots(
      params.userId,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      availableSlots: availableSlots.map(slot => ({
        date: slot.date,
        timeSlot: slot.timeSlot,
        isBooked: slot.isBooked,
        notes: slot.notes
      })),
      total: availableSlots.length
    });

  } catch (error: any) {
    console.error('Error fetching availability:', error);
    
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
