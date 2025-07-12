'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { fadeInUp, staggerContainer } from '../animations/variants';

interface SwapStepProps {
  userName: string;
  onNext: (swapGoals: string[]) => void;
  onBack: () => void;
}

export default function SwapStep({ userName, onNext, onBack }: SwapStepProps) {
  const [goals, setGoals] = useState<string[]>([]);
  const [currentGoal, setCurrentGoal] = useState('');

  const handleAddGoal = () => {
    const trimmed = currentGoal.trim();
    if (trimmed && !goals.includes(trimmed)) {
      setGoals(prev => [...prev, trimmed]);
      setCurrentGoal('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGoal();
    }
  };

  const handleRemoveGoal = (goal: string) => {
    setGoals(prev => prev.filter(g => g !== goal));
  };

  const handleNext = () => {
    if (goals.length) onNext(goals);
  };

  const handleSkip = () => {
    onNext([]); // Skip with empty goals
  };

  const predefinedGoals = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'Cloud Computing',
    'Cybersecurity',
    'Game Development',
    'UI/UX Design',
    'Backend Development',
    'Frontend Development',
    'Full Stack Development'
  ];

  const handlePredefinedGoalClick = (goal: string) => {
    if (!goals.includes(goal)) {
      setGoals(prev => [...prev, goal]);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary font-urbanist relative flex flex-col">
      {/* Username top center */}
      <div className="absolute top-6 w-full flex justify-center">
        <p className="text-sm text-gray-600 font-medium">@{userName}</p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex-1 flex items-center justify-center px-6"
      >
        <div className="w-full max-w-xl text-center">
          {/* Heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-semibold mb-6 text-gray-900"
          >
            What are you looking to learn? 🎯
          </motion.h1>
          
          <motion.p
            variants={fadeInUp}
            className="text-lg text-gray-600 mb-12"
          >
            Tell us what skills or technologies you want to develop next
          </motion.p>

          {/* Predefined Goals */}
          <motion.div variants={fadeInUp} className="mb-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Popular Goals:</h3>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {predefinedGoals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handlePredefinedGoalClick(goal)}
                  disabled={goals.includes(goal)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    goals.includes(goal)
                      ? 'bg-[#ff88b0] text-white border-[#ff88b0] cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff88b0] hover:bg-[#fff0f5]'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Custom Input + Add */}
          <motion.div variants={fadeInUp} className="mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={currentGoal}
                  onChange={(e) => setCurrentGoal(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Custom goal or technology"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fecaca] focus:border-[#fca5a5] text-lg"
                />
              </div>
              <button
                onClick={handleAddGoal}
                disabled={!currentGoal.trim()}
                className="px-6 py-3 bg-[#ff88b0] text-white rounded-xl hover:bg-[#ff6ba0] disabled:bg-[#d1d5db] disabled:cursor-not-allowed font-semibold"
              >
                Add
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2 ml-2 text-left">Press Enter to add custom goals</p>
          </motion.div>

          {/* Goal tags */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap justify-center gap-3 mt-6 mb-10"
          >
            {goals.map((goal, idx) => (
              <motion.div
                key={goal}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff88b0] border border-[#ff88b0] text-white font-medium"
              >
                <span>{goal}</span>
                <button
                  onClick={() => handleRemoveGoal(goal)}
                  className="text-white hover:text-[#f0f0f0] font-bold"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation buttons */}
      <div className="absolute bottom-10 w-full flex justify-between px-6">
        <button
          onClick={onBack}
          className="px-6 py-3 text-[#6b7280] hover:text-[#374151] font-medium transition-colors"
        >
          ← Back
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="px-6 py-3 text-[#6b7280] hover:text-[#374151] font-medium transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleNext}
            disabled={goals.length === 0}
            className="px-8 py-3 rounded-xl bg-[#ff88b0] text-white border border-[#ff88b0] hover:bg-[#ff6ba0] disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:cursor-not-allowed font-semibold flex items-center gap-2"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
