import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';
import { DIContainer } from '../../../../../lib/di/container';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ step: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const step = parseInt(resolvedParams.step);
    if (isNaN(step) || step < 1 || step > 4) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    const body = await request.json();
    const onboardingService = DIContainer.getOnboardingService();
    
    // Check if user can access onboarding
    const canAccess = await onboardingService.canAccessOnboarding(session.user.id);
    if (!canAccess) {
      return NextResponse.json(
        { error: 'Onboarding already completed' },
        { status: 403 }
      );
    }

    const updatedOnboarding = await onboardingService.updateOnboardingStep(
      session.user.id,
      step,
      body
    );
    
    return NextResponse.json({ onboarding: updatedOnboarding });
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
