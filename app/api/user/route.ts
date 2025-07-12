import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '../../../lib/db/connection';
import { User } from '../../../lib/db/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    let user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      // Create user profile if it doesn't exist
      user = new User({
        email: session.user.email,
        name: session.user.name || '',
        image: session.user.image || '',
        provider: 'google',
        providerId: session.user.id,
        onboardingCompleted: false,
        level: 1,
        skills: [],
      });
      await user.save();
    }
    
    return NextResponse.json({ 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        onboardingCompleted: user.onboardingCompleted,
        level: user.level,
        skills: user.skills,
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
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

    const body = await request.json();
    await connectDB();
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      body,
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        onboardingCompleted: user.onboardingCompleted,
        level: user.level,
        skills: user.skills,
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
