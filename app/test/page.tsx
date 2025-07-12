'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && !session?.user?.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [status, session, router]);

  // Show content immediately, redirect happens in background
  if (!session?.user && status !== 'loading') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Skill Assessment 🧪
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test your knowledge and skills to get personalized learning recommendations
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Coming Soon!
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            We&apos;re working hard to bring you the best skill assessment experience. 
            The testing module will be available soon with:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4 text-left">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-800 mb-1">Adaptive Testing</h3>
              <p className="text-sm text-gray-600">Questions that adapt to your skill level</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800 mb-1">Detailed Analytics</h3>
              <p className="text-sm text-gray-600">Comprehensive performance insights</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="font-semibold text-gray-800 mb-1">Skill Certification</h3>
              <p className="text-sm text-gray-600">Earn certificates for your achievements</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="font-semibold text-gray-800 mb-1">Learning Paths</h3>
              <p className="text-sm text-gray-600">Personalized improvement recommendations</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
            >
              Back to Profile
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Home
            </button>
          </div>
        </div>

        {/* Current Skills */}
        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Current Skills</h3>
          {session?.user?.skills && session.user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {session.user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No skills recorded. Complete your onboarding to add skills.</p>
          )}
        </div>
      </div>
    </div>
  );
}
