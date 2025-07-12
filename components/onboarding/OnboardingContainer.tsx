'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepData, setStepData] = useState({
    skills: [] as string[],
    resumeUrl: '',
    level: 1,
  });

  // Fetch user data and handle authentication
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'unauthenticated') {
        window.location.href = '/';
        return;
      }

      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await fetch('/api/user');
          if (response.ok) {
            const data = await response.json();
            setUserData(data.user);
            
            // Check if onboarding is completed - if so, allow access but show different UI
            // Don't redirect anymore, let user access onboarding multiple times if needed
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [status, session]);

  const handleStepComplete = async (step: number, data: any) => {
    try {
      // Update step data locally
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
          // Complete onboarding and update user
          const finalData = {
            level: data.level,
            onboardingCompleted: true,
            skills: stepData.skills,
            resumeUrl: stepData.resumeUrl,
          };
          
          const response = await fetch('/api/user', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalData),
          });
          
          if (response.ok) {
            // Onboarding completed - handled by LevelStep component
            return;
          } else {
            throw new Error('Failed to complete onboarding');
          }
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
