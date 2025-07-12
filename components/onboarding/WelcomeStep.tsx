'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { fadeInUp, staggerContainer } from '../animations/variants';

interface WelcomeStepProps {
  userName: string;
  onNext: (skills: string[]) => void;
}

export default function WelcomeStep({ userName, onNext }: WelcomeStepProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  const handleAddSkill = () => {
    const trimmed = currentSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setCurrentSkill('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleNext = () => {
    if (skills.length) onNext(skills);
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
            className="text-3xl sm:text-4xl font-semibold mb-12 text-gray-900"
          >
            Hey Please Select your skills
          </motion.h1>

          {/* Input + Add */}
          <motion.div variants={fadeInUp} className="mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Python"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-200 focus:border-coral-300 text-lg"
                />
              </div>
              <button
                onClick={handleAddSkill}
                disabled={!currentSkill.trim()}
                className="px-6 py-3 bg-[#ff88b0] text-white rounded-xl hover:bg-[#ff6ba0] disabled:bg-[#d1d5db] disabled:cursor-not-allowed font-semibold"
              >
                Add
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2 ml-2 text-left">Press Enter to add another skill</p>
          </motion.div>

          {/* Skill tags */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap justify-center gap-3 mt-6 mb-10"
          >
            {skills.map((skill, idx) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff88b0] border border-[#ff88b0] text-white font-medium"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-white hover:text-[#f0f0f0] font-bold"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Fixed bottom next button */}
      <div className="absolute bottom-10 w-full flex justify-center">
        <button
          onClick={handleNext}
          disabled={skills.length === 0}
          className="px-8 py-3 rounded-xl bg-[#ff88b0] text-white border border-[#ff88b0] hover:bg-[#ff6ba0] disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:cursor-not-allowed font-semibold flex items-center gap-2"
        >
          Next
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
