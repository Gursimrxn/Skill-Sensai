import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';
import connectDB from '../../../../../lib/db/connection';
import { User } from '../../../../../lib/db/models/User';
import { ConnectionRepository } from '../../../../../lib/db/repositories/ConnectionRepository';
import { UserAvailabilityRepository } from '../../../../../lib/db/repositories/UserAvailabilityRepository';
import { ConnectionService } from '../../../../../lib/services/ConnectionService';

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
    const { date, timeSlot, duration, meetingLink, notes } = body;

    if (!date || !timeSlot) {
      return NextResponse.json(
        { error: 'Date and timeSlot are required' },
        { status: 400 }
      );
    }

    // Extract connection id from URL
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const id = segments[segments.length - 2]; // second last segment is id
    const connectionRepository = new ConnectionRepository();
    const availabilityRepository = new UserAvailabilityRepository();
    const connectionService = new ConnectionService(connectionRepository, availabilityRepository);

    const updatedConnection = await connectionService.scheduleSession(
      id,
      currentUser._id.toString(),
      {
        date: new Date(date),
        timeSlot,
        duration: duration || 60,
        meetingLink,
        notes
      }
    );

    return NextResponse.json({
      connection: {
        id: updatedConnection._id,
        status: updatedConnection.status,
        scheduledSlots: updatedConnection.scheduledSlots,
        requester: {
          id: (updatedConnection.requester as any)._id,
          name: (updatedConnection.requester as any).name,
          email: (updatedConnection.requester as any).email
        },
        recipient: {
          id: (updatedConnection.recipient as any)._id,
          name: (updatedConnection.recipient as any).name,
          email: (updatedConnection.recipient as any).email
        }
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error scheduling session:', error);
    
    if (error.message.includes('not found') || 
        error.message.includes('not authorized') ||
        error.message.includes('not available') ||
        error.message.includes('must be accepted')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { slotIndex, action, notes } = body;

    if (slotIndex === undefined || !action) {
      return NextResponse.json(
        { error: 'slotIndex and action are required' },
        { status: 400 }
      );
    }

    // Extract connection id from URL
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const id = segments[segments.length - 3]; // third last segment is id
    const connectionRepository = new ConnectionRepository();
    const availabilityRepository = new UserAvailabilityRepository();
    const connectionService = new ConnectionService(connectionRepository, availabilityRepository);

    let updatedConnection;

    switch (action) {
      case 'cancel':
        updatedConnection = await connectionService.cancelSession(
          id,
          slotIndex,
          currentUser._id.toString()
        );
        break;
      
      case 'complete':
        updatedConnection = await connectionService.completeSession(
          id,
          slotIndex,
          currentUser._id.toString(),
          notes
        );
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      connection: {
        id: updatedConnection._id,
        status: updatedConnection.status,
        scheduledSlots: updatedConnection.scheduledSlots,
        requester: {
          id: (updatedConnection.requester as any)._id,
          name: (updatedConnection.requester as any).name,
          email: (updatedConnection.requester as any).email
        },
        recipient: {
          id: (updatedConnection.recipient as any)._id,
          name: (updatedConnection.recipient as any).name,
          email: (updatedConnection.recipient as any).email
        }
      }
    });

  } catch (error: any) {
    console.error('Error updating session:', error);
    
    if (error.message.includes('not found') || 
        error.message.includes('not authorized') ||
        error.message.includes('not in scheduled status')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
