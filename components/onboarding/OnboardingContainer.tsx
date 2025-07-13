'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import WelcomeStep from './WelcomeStep';
import SwapStep from './SwapStep';
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
  swapGoals?: string[];
}

export default function OnboardingContainer() {
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stepData, setStepData] = useState({
    skills: [] as string[],
    swapGoals: [] as string[],
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

  const handleStepComplete = (step: number, data: { skills?: string[]; swapGoals?: string[]; resumeUrl?: string; level?: number; extractedSkills?: string[] }) => {
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
        setStepData(prev => ({ ...prev, swapGoals: data.swapGoals ?? [] }));
        setCurrentStep(3);
        // Fire and forget API call
        fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ swapGoals: data.swapGoals }),
        }).catch(() => {});
        break;
      case 3:
        // Merge extracted skills with existing skills
        const allSkills = data.extractedSkills ? 
          [...new Set([...stepData.skills, ...data.extractedSkills])] : 
          stepData.skills;
        
        setStepData(prev => ({ 
          ...prev, 
          resumeUrl: data.resumeUrl ?? '',
          skills: allSkills
        }));
        setCurrentStep(4);
        
        // Fire and forget API call with merged skills
        fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            resumeUrl: data.resumeUrl,
            skills: allSkills
          }),
        }).catch(() => {});
        break;
      case 4:
        // Complete onboarding immediately
        const finalData = {
          level: data.level,
          onboardingCompleted: true,
          skills: stepData.skills,
          swapGoals: stepData.swapGoals,
          resumeUrl: stepData.resumeUrl,
        };
        
        // Fire and forget API call
        fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalData),
        }).catch(() => {});
        
        // Redirect to explore page after completing onboarding
        setTimeout(() => {
          window.location.href = '/explore';
        }, 500); // Small delay to ensure data is saved
        break;
    }
  };

  const handleWelcomeNext = (skills: string[]) => {
    handleStepComplete(1, { skills });
  };

  const handleSwapNext = (swapGoals: string[]) => {
    handleStepComplete(2, { swapGoals });
  };

  const handleResumeNext = (resumeUrl: string, extractedSkills?: string[]) => {
    handleStepComplete(3, { resumeUrl, extractedSkills });
  };

  const handleLevelComplete = (level: number) => {
    handleStepComplete(4, { level });
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
          <SwapStep
            key="swap"
            userName={userName}
            onNext={handleSwapNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <ResumeStep
            key="resume"
            onNext={handleResumeNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 4 && (
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
