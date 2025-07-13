import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Sample users for demonstration
const sampleUsers = [
  {
    id: '1',
    email: 'priya.sharma@gmail.com',
    name: 'Priya Sharma',
    level: 2,
    skills: ['Python', 'Data Science'],
    skillsToLearn: ['Machine Learning', 'TensorFlow'],
    onboardingCompleted: true,
    isBanned: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    email: 'arjun.patel@gmail.com',
    name: 'Arjun Patel',
    level: 1,
    skills: ['JavaScript', 'React'],
    skillsToLearn: ['Next.js', 'TypeScript'],
    onboardingCompleted: true,
    isBanned: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    email: 'vikram.mehta@gmail.com',
    name: 'Vikram Mehta',
    level: 3,
    skills: ['Java', 'Spring Boot'],
    skillsToLearn: ['Microservices', 'Docker'],
    onboardingCompleted: true,
    isBanned: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// GET /api/admin/users - Get all users for admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const ADMIN_EMAILS = ['sgursimranmatharu@gmail.com', 'ekasatwal.work@gmail.com'];
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Return sample users for now (replace with actual DB query later)
    console.log(`Admin ${session.user.email} requesting users - returning ${sampleUsers.length} sample users`);
    return NextResponse.json({ users: sampleUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users - Create or update a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await request.json(); // Parse request body (even if not used yet)
    
    // Implement user creation/update logic here
    return NextResponse.json({ message: 'User processed successfully' });
  } catch (error) {
    console.error('Error processing user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/users - Update user (e.g., ban/unban)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await request.json(); // Parse request body (even if not used yet)
    
    // Implement user update logic here (ban/unban, etc.)
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete a user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await request.json(); // Parse request body (even if not used yet)
    
    // Implement user deletion logic here
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
