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

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Check if the other user exists
    const otherUser = await User.findById(params.userId);
    if (!otherUser) {
      return NextResponse.json({ error: 'Other user not found' }, { status: 404 });
    }

    const availabilityRepository = new UserAvailabilityRepository();
    const availabilityService = new AvailabilityService(availabilityRepository);

    const commonSlots = await availabilityService.getCommonAvailability(
      currentUser._id.toString(),
      params.userId,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      commonAvailability: commonSlots.map((slot: any) => ({
        date: slot.date,
        timeSlot: slot.timeSlot,
        notes: slot.notes
      })),
      total: commonSlots.length,
      users: {
        currentUser: {
          id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email
        },
        otherUser: {
          id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching common availability:', error);
    
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
