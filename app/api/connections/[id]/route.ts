import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import connectDB from '../../../../lib/db/connection';
import { User } from '../../../../lib/db/models/User';
import { ConnectionRepository } from '../../../../lib/db/repositories/ConnectionRepository';
import { UserAvailabilityRepository } from '../../../../lib/db/repositories/UserAvailabilityRepository';
import { ConnectionService } from '../../../../lib/services/ConnectionService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const connectionRepository = new ConnectionRepository();
    const availabilityRepository = new UserAvailabilityRepository();
    const connectionService = new ConnectionService(connectionRepository, availabilityRepository);

    let updatedConnection;

    switch (action) {
      case 'accept':
        updatedConnection = await connectionService.acceptConnection(
          params.id,
          currentUser._id.toString()
        );
        break;
      
      case 'decline':
        updatedConnection = await connectionService.declineConnection(
          params.id,
          currentUser._id.toString()
        );
        break;
      
      case 'cancel':
        updatedConnection = await connectionService.cancelConnection(
          params.id,
          currentUser._id.toString()
        );
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      connection: {
        id: updatedConnection._id,
        status: updatedConnection.status,
        connectionType: updatedConnection.connectionType,
        message: updatedConnection.message,
        skillsOffered: updatedConnection.skillsOffered,
        skillsRequested: updatedConnection.skillsRequested,
        requester: {
          id: (updatedConnection.requester as any)._id,
          name: (updatedConnection.requester as any).name,
          email: (updatedConnection.requester as any).email,
          image: (updatedConnection.requester as any).image
        },
        recipient: {
          id: (updatedConnection.recipient as any)._id,
          name: (updatedConnection.recipient as any).name,
          email: (updatedConnection.recipient as any).email,
          image: (updatedConnection.recipient as any).image
        },
        scheduledSlots: updatedConnection.scheduledSlots || [],
        updatedAt: updatedConnection.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Error updating connection:', error);
    
    if (error.message.includes('not found') || 
        error.message.includes('not authorized') ||
        error.message.includes('not in pending status')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const connectionRepository = new ConnectionRepository();
    const availabilityRepository = new UserAvailabilityRepository();
    const connectionService = new ConnectionService(connectionRepository, availabilityRepository);

    await connectionService.cancelConnection(params.id, currentUser._id.toString());

    return NextResponse.json({ message: 'Connection deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting connection:', error);
    
    if (error.message.includes('not found') || error.message.includes('not authorized')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
