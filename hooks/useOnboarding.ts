import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export interface OnboardingProgress {
  userId: string;
  currentStep: number;
  steps: {
    welcome: {
      completed: boolean;
      skills?: string[];
      completedAt?: string;
    };
    resume: {
      completed: boolean;
      resumeUrl?: string;
      completedAt?: string;
    };
    levelAssignment: {
      completed: boolean;
      level?: number;
      completedAt?: string;
    };
  };
  completed: boolean;
  completedAt?: string;
}

export const useOnboarding = () => {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch('/api/onboarding');
      
      if (!response.ok) {
        throw new Error('Failed to fetch onboarding progress');
      }

      const data = await response.json();
      setProgress(data.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateStep = async (step: number, data: any) => {
    if (!session?.user?.id) throw new Error('Not authenticated');

    try {
      const response = await fetch(`/api/onboarding/step/${step}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update onboarding step');
      }

      const result = await response.json();
      setProgress(result.onboarding);
      return result.onboarding;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const createSession = async () => {
    if (!session?.user?.id) throw new Error('Not authenticated');

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create onboarding session');
      }

      const data = await response.json();
      setProgress(data.session);
      return data.session;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProgress();
    }
  }, [status, session?.user?.id]);

  return {
    progress,
    loading,
    error,
    updateStep,
    createSession,
    refetch: fetchProgress,
  };
};
