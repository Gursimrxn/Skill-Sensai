'use client';

import { SessionProvider } from 'next-auth/react';
import OnboardingContainer from '../../components/onboarding/OnboardingContainer';

export default function OnboardingPage() {
  return (
    <SessionProvider>
      <OnboardingContainer />
    </SessionProvider>
  );
}
