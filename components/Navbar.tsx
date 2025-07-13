'use client';

import Image from "next/image"
import { signIn } from "next-auth/react";

const Navbar = () => {
    const handleGoogleSignIn = async () => {
    console.log('Get Started button clicked!');
    try {
      // Use default redirect behavior for OAuth flow
      await signIn('google', { callbackUrl: '/explore' });
    } catch (error) {
      console.error('SignIn failed:', error);
    }
  };
    return (
        <nav className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
                  <Image src="/logo.png" alt="logo" width={32} height={32} />
                </div>
                <span className="text-2xl font-bold text-gray-800">Skill Sensai</span>
              </div>
              <button 
                onClick={handleGoogleSignIn}
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
                >
                Get Started
              </button>
            </div>
          </div>
        </nav>
    )
}

export default Navbar;