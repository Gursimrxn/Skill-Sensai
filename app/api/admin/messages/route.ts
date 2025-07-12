import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';

const ADMIN_EMAIL = 'sgursimranmatharu@gmail.com';

// Check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === ADMIN_EMAIL;
}

// For now, store messages in memory (in production, use database)
const platformMessages: any[] = [];

// GET /api/admin/messages - Get all platform messages
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      messages: platformMessages.map(message => ({
        id: message.id,
        title: message.title,
        content: message.content,
        type: message.type,
        targetUsers: message.targetUsers,
        status: message.status,
        sentAt: message.sentAt,
        sentBy: message.sentBy,
        createdAt: message.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/messages - Send platform message
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getServerSession(authOptions);

    const body = await request.json();
    const { title, content, type, targetUsers } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const message = {
      id: `msg_${Date.now()}`,
      title,
      content,
      type: type || 'announcement',
      targetUsers: targetUsers || 'all',
      status: 'sent',
      sentAt: new Date().toISOString(),
      sentBy: session?.user?.email || 'admin',
      createdAt: new Date().toISOString()
    };

    platformMessages.push(message);

    // Here you would implement actual message sending logic
    // e.g., email notifications, in-app notifications, etc.
    console.log('Platform message sent:', message);

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
