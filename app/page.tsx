'use client';

import { useSession, signIn } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/explore' });
  };

  // Show the landing page even if user is authenticated
  // Only redirect when they click a button
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/illustration.png')"
      }}
    >
      {/* Navigation */}
      <nav className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">Skill Sensai</span>
            </div>
            <button 
              onClick={handleGoogleSignIn}
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Tagline */}
          <div className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm mb-8">
            The Smarter Way to Level Up — Together
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Skill Sensai is Where<br />
            Skills Meet, Grow, and Evolve
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            List what you know. Request what you want to learn. Connect with<br />
            real people for real growth — one swap at a time.
          </p>
          
          {/* CTA Button */}
          <button 
            onClick={handleGoogleSignIn}
            className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center space-x-2"
          >
            <span>Learn Something New</span>
            <span>→</span>
          </button>
        </div>
      </section>
    </div>
  );
}
