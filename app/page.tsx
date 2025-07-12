'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Instant redirect after sign in - no waiting
    if (status === 'authenticated' && session?.user) {
      window.location.href = '/onboarding';
    }
  }, [status, session]);

  const handleGoogleSignIn = () => {
    signIn('google');
  };

  if (status === 'authenticated') {
    // Instant redirect, no loading screen
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <Image
              className="mx-auto mb-4 dark:invert"
              src="/logo.png"
              alt="Skill Sensai logo"
              width={200}
              height={50}
              priority
            />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Skill Sensai
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Master your skills, track your progress, and unlock your potential with personalized learning paths.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Skill Assessment
              </h3>
              <p className="text-gray-600">
                Take personalized tests to discover your current skill level and areas for improvement.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Monitor your learning journey with detailed analytics and milestone tracking.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Personalized Learning
              </h3>
              <p className="text-gray-600">
                Get customized learning recommendations based on your goals and current skill level.
              </p>
            </div>
          </div>

          {/* Sign in Section */}
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Get Started Today
            </h2>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Sign in to access your personalized learning dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
