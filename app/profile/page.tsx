'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserData {
  id: string;
  email: string;
  name: string;
  image?: string;
  onboardingCompleted: boolean;
  level: number;
  skills: string[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'unauthenticated') {
        router.push('/');
        return;
      }

      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await fetch('/api/user');
          if (response.ok) {
            const data = await response.json();
            setUserData(data.user);
            
            // If onboarding is not completed, redirect to onboarding
            if (!data.user.onboardingCompleted) {
              router.push('/onboarding');
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [status, session, router]);

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

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {userData.image && (
                <img
                  src={userData.image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {userData.name}!
                </h1>
                <p className="text-gray-600">Level {userData.level} Developer</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">Current Level</h3>
            <p className="text-3xl font-bold text-blue-600">{userData.level}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">Skills</h3>
            <p className="text-3xl font-bold text-green-600">
              {userData.skills?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">Tests Taken</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Skills</h2>
          {userData.skills && userData.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No skills added yet.</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/test')}
              className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-left"
            >
              <div className="text-2xl mb-2">🧪</div>
              <h3 className="text-xl font-semibold mb-1">Take a Test</h3>
              <p className="text-blue-100">Assess your skills and improve your level</p>
            </button>
            <button className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-left">
              <div className="text-2xl mb-2">📖</div>
              <h3 className="text-xl font-semibold mb-1">Learning Path</h3>
              <p className="text-green-100">Explore personalized learning recommendations</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
