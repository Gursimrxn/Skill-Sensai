'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import WelcomeStep from './WelcomeStep';
import ResumeStep from './ResumeStep';
import LevelStep from './LevelStep';

interface UserData {
  id: string;
  email: string;
  name: string;
  image?: string;
  onboardingCompleted: boolean;
  level: number;
  skills: string[];
}

export default function OnboardingContainer() {
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stepData, setStepData] = useState({
    skills: [] as string[],
    resumeUrl: '',
    level: 1,
  });

  // Quick setup - no loading delays
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/';
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Set user data immediately from session
      setUserData({
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        image: session.user.image || '',
        onboardingCompleted: false,
        level: 1,
        skills: [],
      });
      
      // Fire and forget API call to sync user data
      fetch('/api/user').catch(() => {});
    }
  }, [status, session]);

  const handleStepComplete = (step: number, data: { skills?: string[]; resumeUrl?: string; level?: number }) => {
    // Instant UI updates - no waiting for API
    switch (step) {
      case 1:
        setStepData(prev => ({ ...prev, skills: data.skills ?? [] }));
        setCurrentStep(2);
        // Fire and forget API call
        fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skills: data.skills }),
        }).catch(() => {});
        break;
      case 2:
        setStepData(prev => ({ ...prev, resumeUrl: data.resumeUrl ?? '' }));
        setCurrentStep(3);
        // Fire and forget API call
        fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeUrl: data.resumeUrl }),
        }).catch(() => {});
        break;
      case 3:
        // Complete onboarding immediately
        const finalData = {
          level: data.level,
          onboardingCompleted: true,
          skills: stepData.skills,
          resumeUrl: stepData.resumeUrl,
        };
        
        // Fire and forget API call
        fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalData),
        }).catch(() => {});
        break;
    }
  };

  const handleWelcomeNext = (skills: string[]) => {
    handleStepComplete(1, { skills });
  };

  const handleResumeNext = (resumeUrl: string) => {
    handleStepComplete(2, { resumeUrl });
  };

  const handleLevelComplete = (level: number) => {
    handleStepComplete(3, { level });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (status === 'unauthenticated' || !userData) {
    return null;
  }

  const userName = userData.name?.split(' ')[0] || 'there';

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <WelcomeStep
            key="welcome"
            userName={userName}
            onNext={handleWelcomeNext}
          />
        )}
        {currentStep === 2 && (
          <ResumeStep
            key="resume"
            onNext={handleResumeNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <LevelStep
            key="level"
            onComplete={handleLevelComplete}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
