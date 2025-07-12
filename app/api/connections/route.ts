import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/authOptions';
import connectDB from '../../../lib/db/connection';
import { User } from '../../../lib/db/models/User';
import { ConnectionRepository } from '../../../lib/db/repositories/ConnectionRepository';
import { UserAvailabilityRepository } from '../../../lib/db/repositories/UserAvailabilityRepository';
import { ConnectionService } from '../../../lib/services/ConnectionService';

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
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'received', 'sent', or 'all'

    const connectionRepository = new ConnectionRepository();
    const availabilityRepository = new UserAvailabilityRepository();
    const connectionService = new ConnectionService(connectionRepository, availabilityRepository);

    let connections;

    switch (type) {
      case 'received':
        connections = await connectionService.getPendingRequests(currentUser._id.toString());
        break;
      case 'sent':
        connections = await connectionService.getSentRequests(currentUser._id.toString());
        break;
      default:
        connections = await connectionService.getUserConnections(currentUser._id.toString(), status || undefined);
    }

    // Format the response
    const formattedConnections = connections.map((connection: any) => ({
      id: connection._id,
      status: connection.status,
      connectionType: connection.connectionType,
      message: connection.message,
      skillsOffered: connection.skillsOffered,
      skillsRequested: connection.skillsRequested,
      requester: {
        id: connection.requester._id,
        name: connection.requester.name,
        email: connection.requester.email,
        image: connection.requester.image,
        skills: connection.requester.skills,
        level: connection.requester.level
      },
      recipient: {
        id: connection.recipient._id,
        name: connection.recipient.name,
        email: connection.recipient.email,
        image: connection.recipient.image,
        skills: connection.recipient.skills,
        level: connection.recipient.level
      },
      scheduledSlots: connection.scheduledSlots || [],
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt
    }));

    return NextResponse.json({
      connections: formattedConnections,
      total: formattedConnections.length
    });

  } catch (error) {
    console.error('Error fetching connections:', error);
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
    const {
      recipientId,
      connectionType,
      message,
      skillsOffered,
      skillsRequested
    } = body;

    // Validate required fields
    if (!recipientId || !connectionType || !skillsOffered || !skillsRequested) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientId, connectionType, skillsOffered, skillsRequested' },
        { status: 400 }
      );
    }

    // Validate connection type
    if (!['skill-swap', 'mentorship', 'collaboration'].includes(connectionType)) {
      return NextResponse.json(
        { error: 'Invalid connectionType. Must be skill-swap, mentorship, or collaboration' },
        { status: 400 }
      );
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    if (!recipient.onboardingCompleted) {
      return NextResponse.json(
        { error: 'Recipient has not completed onboarding' },
        { status: 400 }
      );
    }

    const connectionRepository = new ConnectionRepository();
    const availabilityRepository = new UserAvailabilityRepository();
    const connectionService = new ConnectionService(connectionRepository, availabilityRepository);

    const connection = await connectionService.createConnectionRequest({
      requesterId: currentUser._id.toString(),
      recipientId,
      connectionType,
      message,
      skillsOffered,
      skillsRequested
    });

    return NextResponse.json({
      connection: {
        id: connection._id,
        status: connection.status,
        connectionType: connection.connectionType,
        message: connection.message,
        skillsOffered: connection.skillsOffered,
        skillsRequested: connection.skillsRequested,
        requester: {
          id: (connection.requester as any)._id,
          name: (connection.requester as any).name,
          email: (connection.requester as any).email,
          image: (connection.requester as any).image
        },
        recipient: {
          id: (connection.recipient as any)._id,
          name: (connection.recipient as any).name,
          email: (connection.recipient as any).email,
          image: (connection.recipient as any).image
        },
        createdAt: connection.createdAt
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating connection:', error);
    
    if (error.message === 'Connection already exists between these users') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    if (error.message === 'Cannot connect to yourself') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
