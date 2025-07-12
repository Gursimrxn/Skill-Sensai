'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface LevelStepProps {
  onComplete: (level: number) => void;
  onBack: () => void;
}

export default function LevelStep({ onComplete }: LevelStepProps) {
  const [level] = useState(1);

  const handleTakeTest = () => {
    // Complete onboarding and redirect to test instantly
    onComplete(level);
    window.location.href = '/test';
  };

  const handleSkip = () => {
    // Complete onboarding and redirect to profile instantly
    onComplete(level);
    window.location.href = '/profile';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-surface-primary p-8"
    >
      <div className="w-full max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            You are Level 1,
          </h1>
          <p className="text-xl text-gray-600">
            Take test for better assignment
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <button
              onClick={handleTakeTest}
              className="px-12 py-3 bg-[#ff88b0] text-white rounded-lg hover:bg-[#ff6ba0] transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
            >
              Take 15 min Test
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <button
              onClick={handleSkip}
              className="px-12 py-3 bg-[#ff88b0] text-white rounded-lg hover:bg-[#ff6ba0] transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
            >
              Next
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
