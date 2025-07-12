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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser || !currentUser.onboardingCompleted) {
      return NextResponse.json({ 
        recommendations: [],
        message: 'Complete your onboarding to get personalized recommendations'
      });
    }

    const userSkills = currentUser.skills || [];
    const userSkillsToLearn = currentUser.skillsToLearn || [];

    // Find users who:
    // 1. Have skills that current user wants to learn
    // 2. Want to learn skills that current user has
    // 3. Have similar skill levels
    const recommendations = await User.aggregate([
      {
        $match: {
          email: { $ne: session.user.email },
          onboardingCompleted: true,
          $or: [
            // Users who have skills I want to learn
            { skills: { $in: userSkillsToLearn } },
            // Users who want to learn skills I have
            { skillsToLearn: { $in: userSkills } }
          ]
        }
      },
      {
        $addFields: {
          // Calculate compatibility score
          compatibilityScore: {
            $add: [
              // Skills they have that I want to learn
              {
                $size: {
                  $ifNull: [
                    { $setIntersection: ['$skills', userSkillsToLearn] },
                    []
                  ]
                }
              },
              // Skills I have that they want to learn
              {
                $size: {
                  $ifNull: [
                    { $setIntersection: ['$skillsToLearn', userSkills] },
                    []
                  ]
                }
              },
              // Level proximity bonus (closer levels get higher scores)
              {
                $subtract: [
                  5,
                  { $abs: { $subtract: ['$level', currentUser.level] } }
                ]
              }
            ]
          },
          // Skills they can teach me
          canTeachMe: {
            $setIntersection: ['$skills', userSkillsToLearn]
          },
          // Skills I can teach them
          canLearnFromMe: {
            $setIntersection: ['$skillsToLearn', userSkills]
          }
        }
      },
      {
        $match: {
          compatibilityScore: { $gt: 0 }
        }
      },
      {
        $sort: { compatibilityScore: -1, level: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          name: 1,
          email: 1,
          image: 1,
          skills: 1,
          skillsToLearn: 1,
          level: 1,
          availability: 1,
          compatibilityScore: 1,
          canTeachMe: 1,
          canLearnFromMe: 1,
          memberSince: '$createdAt'
        }
      }
    ]);

    // Format recommendations with reasons
    const formattedRecommendations = recommendations.map((user: any) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      skills: user.skills || [],
      skillsToLearn: user.skillsToLearn || [],
      level: user.level,
      availability: user.availability || null,
      memberSince: user.memberSince,
      compatibilityScore: user.compatibilityScore,
      matchReasons: {
        canTeachYou: user.canTeachMe || [],
        canLearnFromYou: user.canLearnFromMe || [],
        levelDifference: Math.abs(user.level - currentUser.level)
      }
    }));

    return NextResponse.json({
      recommendations: formattedRecommendations,
      total: formattedRecommendations.length,
      userProfile: {
        skills: userSkills,
        skillsToLearn: userSkillsToLearn,
        level: currentUser.level
      }
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
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

    const body = await request.json();
    const { 
      includeSkillsMatch = true,
      includeLevelMatch = true,
      includeAvailabilityMatch = false,
      maxLevelDifference = 3,
      limit = 10 
    } = body;

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser || !currentUser.onboardingCompleted) {
      return NextResponse.json({ 
        recommendations: [],
        message: 'Complete your onboarding to get personalized recommendations'
      });
    }

    const userSkills = currentUser.skills || [];
    const userSkillsToLearn = currentUser.skillsToLearn || [];
    const userAvailability = currentUser.availability;

    // Build match conditions
    const matchConditions: any[] = [];
    
    if (includeSkillsMatch) {
      matchConditions.push(
        { skills: { $in: userSkillsToLearn } },
        { skillsToLearn: { $in: userSkills } }
      );
    }

    let levelCondition: any = {};
    if (includeLevelMatch) {
      levelCondition.level = {
        $gte: Math.max(1, currentUser.level - maxLevelDifference),
        $lte: currentUser.level + maxLevelDifference
      };
    }

    let availabilityCondition: any = {};
    if (includeAvailabilityMatch && userAvailability?.days?.length) {
      availabilityCondition['availability.days'] = { $in: userAvailability.days };
    }

    const recommendations = await User.aggregate([
      {
        $match: {
          email: { $ne: session.user.email },
          onboardingCompleted: true,
          ...levelCondition,
          ...availabilityCondition,
          ...(matchConditions.length > 0 ? { $or: matchConditions } : {})
        }
      },
      {
        $addFields: {
          compatibilityScore: {
            $add: [
              // Skills matching score
              includeSkillsMatch ? {
                $add: [
                  { $size: { $ifNull: [{ $setIntersection: ['$skills', userSkillsToLearn] }, []] } },
                  { $size: { $ifNull: [{ $setIntersection: ['$skillsToLearn', userSkills] }, []] } }
                ]
              } : 0,
              // Level proximity score
              includeLevelMatch ? {
                $subtract: [maxLevelDifference + 1, { $abs: { $subtract: ['$level', currentUser.level] } }]
              } : 0,
              // Availability matching score
              includeAvailabilityMatch && userAvailability?.days?.length ? {
                $size: { 
                  $ifNull: [
                    { $setIntersection: ['$availability.days', userAvailability.days] }, 
                    []
                  ] 
                }
              } : 0
            ]
          },
          canTeachMe: { $setIntersection: ['$skills', userSkillsToLearn] },
          canLearnFromMe: { $setIntersection: ['$skillsToLearn', userSkills] },
          availabilityMatch: includeAvailabilityMatch && userAvailability?.days?.length ? {
            $setIntersection: ['$availability.days', userAvailability.days]
          } : []
        }
      },
      {
        $sort: { compatibilityScore: -1, level: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          name: 1,
          email: 1,
          image: 1,
          skills: 1,
          skillsToLearn: 1,
          level: 1,
          availability: 1,
          compatibilityScore: 1,
          canTeachMe: 1,
          canLearnFromMe: 1,
          availabilityMatch: 1,
          memberSince: '$createdAt'
        }
      }
    ]);

    const formattedRecommendations = recommendations.map((user: any) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      skills: user.skills || [],
      skillsToLearn: user.skillsToLearn || [],
      level: user.level,
      availability: user.availability || null,
      memberSince: user.memberSince,
      compatibilityScore: user.compatibilityScore,
      matchReasons: {
        canTeachYou: user.canTeachMe || [],
        canLearnFromYou: user.canLearnFromMe || [],
        levelDifference: Math.abs(user.level - currentUser.level),
        sharedAvailability: user.availabilityMatch || []
      }
    }));

    return NextResponse.json({
      recommendations: formattedRecommendations,
      total: formattedRecommendations.length,
      searchCriteria: {
        includeSkillsMatch,
        includeLevelMatch,
        includeAvailabilityMatch,
        maxLevelDifference
      },
      userProfile: {
        skills: userSkills,
        skillsToLearn: userSkillsToLearn,
        level: currentUser.level,
        availability: userAvailability
      }
    });

  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
