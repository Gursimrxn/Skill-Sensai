import {  NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/authOptions';
import { DIContainer } from '../../../lib/di/container';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onboardingService = DIContainer.getOnboardingService();
    const progress = await onboardingService.getOnboardingProgress(session.user.id);
    
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onboardingService = DIContainer.getOnboardingService();
    const onboardingSession = await onboardingService.createOnboardingSession(session.user.id);
    
    return NextResponse.json({ session: onboardingSession });
  } catch (error) {
    console.error('Error creating onboarding session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
