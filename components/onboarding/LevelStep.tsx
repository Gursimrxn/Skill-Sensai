'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LevelStepProps {
  onComplete: (level: number) => void;
  onBack: () => void;
}

export default function LevelStep({ onComplete, onBack }: LevelStepProps) {
  const [level, setLevel] = useState(1);
  const [showLevel, setShowLevel] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate level calculation based on skills and resume
    setTimeout(() => {
      setLevel(1); // You can implement actual level calculation logic here
      setShowLevel(true);
    }, 1000);
  }, []);

  const handleTakeTest = () => {
    // Complete onboarding and redirect to test
    onComplete(level);
    router.push('/test');
  };

  const handleSkip = () => {
    // Complete onboarding and redirect to profile
    onComplete(level);
    router.push('/profile');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-8"
    >
      {/* Skip Button - Top Right */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={handleSkip}
        className="fixed top-8 right-8 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors bg-white rounded-lg shadow-md hover:shadow-lg"
      >
        Skip &gt;&gt;&gt;
      </motion.button>

      <div className="w-full max-w-2xl">
        {!showLevel ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-700">
              Calculating your level...
            </h2>
          </motion.div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Your level is {level} 🎯
              </h1>
              <p className="text-xl text-gray-600">
                Ready to test your skills?
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <span className="text-5xl font-bold text-white">{level}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 mb-8"
              >
                <h3 className="text-2xl font-semibold text-gray-800">
                  Beginner Level
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Great start! You&apos;re ready to begin your skill development journey. 
                  Take a quick assessment to get personalized learning recommendations.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-between mt-8"
              >
                <button
                  onClick={onBack}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  ← Back
                </button>
                
                <button
                  onClick={handleTakeTest}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Take a Test 🚀
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
