import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import connectDB from '../../../../lib/db/connection';
import { User } from '../../../../lib/db/models/User';

const ADMIN_EMAIL = 'sgursimranmatharu@gmail.com';

// Check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.email === ADMIN_EMAIL;
}

// GET /api/admin/skills - Get skill data for review (using user skills for now)
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // For now, return users with their skills for admin review
    const users = await User.find({ onboardingCompleted: true })
      .select('name email skills level createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    await User.countDocuments({ onboardingCompleted: true });

    // Transform user skills into reviewable format
    const skillData = users.flatMap((user: any) => 
      (user.skills || []).map((skill: string, index: number) => ({
        id: `${user._id}_${index}`,
        userId: user._id.toString(),
        userName: user.name,
        userEmail: user.email,
        skill: skill,
        description: `User expertise in ${skill}`,
        status: 'approved', // For existing skills
        reportCount: 0,
        reports: [],
        createdAt: user.createdAt,
        reviewedAt: null,
        reviewedBy: null
      }))
    );

    return NextResponse.json({
      skills: skillData,
      pagination: {
        page,
        limit,
        total: skillData.length,
        pages: Math.ceil(skillData.length / limit)
      },
      stats: {
        pending: 0,
        approved: skillData.length,
        rejected: 0
      }
    });

  } catch (error) {
    console.error('Error fetching skill data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/skills - Handle skill moderation (simplified for now)
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { skillId, action } = body;

    if (!skillId || !action) {
      return NextResponse.json(
        { error: 'skillId and action are required' },
        { status: 400 }
      );
    }

    // For now, just return success since we're working with existing user skills
    return NextResponse.json({
      success: true,
      skill: {
        id: skillId,
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
