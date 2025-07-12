'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Set user data immediately from session
      setUserData({
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        image: session.user.image || '',
        onboardingCompleted: true,
        level: session.user.level || 1,
        skills: session.user.skills || [],
      });
      
      // Fire and forget API call to sync latest data
      fetch('/api/user')
        .then(res => res.json())
        .then(data => setUserData(data.user))
        .catch(() => {});
    }
  }, [status, session, router]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleBackToExplore = () => {
    router.push('/explore');
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#fffbf7] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbf7] font-urbanist">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackToExplore}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Explore
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Image
            className=""
            src="/logo.png"
            alt="Skill Sensai logo"
            width={32}
            height={32}
            priority
          />
          <h1 className="text-xl font-bold text-gray-900 font-urbanist">
            Skill Sensei
          </h1>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Info */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-6 mb-6">
            {userData.image && (
              <Image
                src={userData.image}
                alt="Profile"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full border-2 border-orange-200"
              />
            )}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-urbanist">
                {userData.name}
              </h2>
              <p className="text-gray-600 text-lg">Level {userData.level} Learner</p>
              <p className="text-gray-500">{userData.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 font-urbanist">Current Level</h3>
                <p className="text-2xl font-bold text-blue-600">{userData.level}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 font-urbanist">Skills</h3>
                <p className="text-2xl font-bold text-green-600">
                  {userData.skills?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 font-urbanist">Connections</h3>
                <p className="text-2xl font-bold text-purple-600">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-urbanist">Your Skills</h3>
          {userData.skills && userData.skills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {userData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No skills added yet</p>
              <button 
                onClick={() => router.push('/onboarding')}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Complete Your Profile
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-urbanist">Quick Actions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push('/test')}
              className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🧪</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-1 font-urbanist">Take a Test</h4>
                  <p className="text-blue-100 text-sm">Assess your skills and improve your level</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={handleBackToExplore}
              className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌟</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-1 font-urbanist">Explore & Connect</h4>
                  <p className="text-green-100 text-sm">Find others to learn and grow with</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
