import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import connectDB from '../../../../lib/db/connection';
import { Connection } from '../../../../lib/db/models/Connection';

const ADMIN_EMAIL = 'sgursimranmatharu@gmail.com';

// Check if user is admin
async function isAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user?.email === ADMIN_EMAIL;
}

// GET /api/admin/swaps - Get all swaps/connections for monitoring
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query = status ? { status } : {};

    const swaps = await Connection.find(query)
      .populate('requester', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Connection.countDocuments(query);

    return NextResponse.json({
      swaps: swaps.map(swap => ({
        id: swap._id.toString(),
        requester: {
          id: swap.requester._id.toString(),
          name: swap.requester.name,
          email: swap.requester.email
        },
        responder: {
          id: swap.recipient._id.toString(),
          name: swap.recipient.name,
          email: swap.recipient.email
        },
        skillsOffered: swap.skillsOffered || [],
        skillsRequested: swap.skillsRequested || [],
        status: swap.status,
        message: swap.message,
        createdAt: swap.createdAt,
        acceptedAt: swap.acceptedAt,
        scheduledSessions: swap.scheduledSlots || []
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        pending: await Connection.countDocuments({ status: 'pending' }),
        accepted: await Connection.countDocuments({ status: 'accepted' }),
        declined: await Connection.countDocuments({ status: 'declined' }),
        cancelled: await Connection.countDocuments({ status: 'cancelled' })
      }
    });

  } catch (error) {
    console.error('Error fetching swaps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
