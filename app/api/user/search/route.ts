import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import connectDB from '../../../../lib/db/connection';
import { User } from '../../../../lib/db/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const skillsToLearn = searchParams.get('skillsToLearn')?.split(',').filter(Boolean) || [];
    const level = searchParams.get('level') ? parseInt(searchParams.get('level')!) : undefined;
    const days = searchParams.get('days')?.split(',').filter(Boolean) || [];
    const timeSlots = searchParams.get('timeSlots')?.split(',').filter(Boolean) || [];
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    // Build search query
    const query: any = { 
      onboardingCompleted: true,
      email: { $ne: session.user.email } // Exclude current user from results
    };
    
    if (skills.length > 0) {
      query.skills = { $in: skills };
    }
    
    if (skillsToLearn.length > 0) {
      query.skillsToLearn = { $in: skillsToLearn };
    }
    
    if (level) {
      query.level = level;
    }
    
    if (days.length > 0) {
      query['availability.days'] = { $in: days };
    }
    
    if (timeSlots.length > 0) {
      query['availability.timeSlots'] = { $in: timeSlots };
    }

    // Execute search
    const users = await User.find(query)
      .limit(Math.min(limit, 50)) // Cap at 50 results
      .select('name email image skills skillsToLearn level availability createdAt')
      .sort({ level: -1, createdAt: -1 });

    // Format response
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      skills: user.skills || [],
      skillsToLearn: user.skillsToLearn || [],
      level: user.level,
      availability: user.availability || null,
      memberSince: user.createdAt
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length,
      searchCriteria: {
        skills,
        skillsToLearn,
        level,
        availability: {
          days,
          timeSlots
        }
      }
    });

  } catch (error) {
    console.error('Error searching users:', error);
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

    const body = await request.json();
    const {
      skills = [],
      skillsToLearn = [],
      level,
      availability,
      limit = 20
    } = body;

    // Build search query
    const query: any = { 
      onboardingCompleted: true,
      email: { $ne: session.user.email }
    };
    
    if (skills.length > 0) {
      query.skills = { $in: skills };
    }
    
    if (skillsToLearn.length > 0) {
      query.skillsToLearn = { $in: skillsToLearn };
    }
    
    if (level) {
      query.level = level;
    }
    
    if (availability?.days?.length > 0) {
      query['availability.days'] = { $in: availability.days };
    }
    
    if (availability?.timeSlots?.length > 0) {
      query['availability.timeSlots'] = { $in: availability.timeSlots };
    }

    // Execute search with advanced matching
    const users = await User.find(query)
      .limit(Math.min(limit, 50))
      .select('name email image skills skillsToLearn level availability createdAt')
      .sort({ level: -1, createdAt: -1 });

    // Calculate match scores for better ranking
    const usersWithScores = users.map(user => {
      let matchScore = 0;
      
      // Skill matching score
      if (skills.length > 0) {
        const matchingSkills = user.skills?.filter((skill: string) => skills.includes(skill)) || [];
        matchScore += matchingSkills.length * 2;
      }
      
      // Skills to learn matching score
      if (skillsToLearn.length > 0) {
        const matchingSkillsToLearn = user.skillsToLearn?.filter((skill: string) => skillsToLearn.includes(skill)) || [];
        matchScore += matchingSkillsToLearn.length;
      }
      
      // Level bonus
      matchScore += user.level * 0.1;

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        skills: user.skills || [],
        skillsToLearn: user.skillsToLearn || [],
        level: user.level,
        availability: user.availability || null,
        memberSince: user.createdAt,
        matchScore
      };
    });

    // Sort by match score
    usersWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      users: usersWithScores,
      total: usersWithScores.length,
      searchCriteria: {
        skills,
        skillsToLearn,
        level,
        availability
      }
    });

  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
