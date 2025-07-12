'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../../hooks/useOnboarding';
import WelcomeStep from './WelcomeStep';
import ResumeStep from './ResumeStep';
import LevelStep from './LevelStep';

export default function OnboardingContainer() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { progress, updateStep, createSession, loading } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({
    skills: [] as string[],
    resumeUrl: '',
    level: 1,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && session?.user?.onboardingCompleted) {
      router.push('/profile');
      return;
    }

    if (progress) {
      setCurrentStep(progress.currentStep);
      // Restore step data from progress
      if (progress.steps.welcome.completed) {
        setStepData(prev => ({
          ...prev,
          skills: progress.steps.welcome.skills || [],
        }));
      }
      if (progress.steps.resume.completed) {
        setStepData(prev => ({
          ...prev,
          resumeUrl: progress.steps.resume.resumeUrl || '',
        }));
      }
    } else if (session?.user?.id && !loading) {
      // Create initial onboarding session
      createSession();
    }
  }, [status, session, progress, router, loading, createSession]);

  const handleStepComplete = async (step: number, data: any) => {
    try {
      await updateStep(step, data);
      
      // Update local step data
      switch (step) {
        case 1:
          setStepData(prev => ({ ...prev, skills: data.skills }));
          setCurrentStep(2);
          break;
        case 2:
          setStepData(prev => ({ ...prev, resumeUrl: data.resumeUrl }));
          setCurrentStep(3);
          break;
        case 3:
          setStepData(prev => ({ ...prev, level: data.level }));
          // Onboarding completed - redirect will be handled by the component
          break;
      }
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      alert('Failed to save progress. Please try again.');
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const userName = session?.user?.name?.split(' ')[0] || 'there';

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
