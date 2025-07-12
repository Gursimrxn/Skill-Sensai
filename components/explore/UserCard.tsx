import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface UserCardProps {
  user: any; // using API user object with skills and skillsToLearn
  index: number;
  onRequest: (userId: number) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, index, onRequest }) => {
  const knows = user.skills || [];
  const teaches = user.skillsToLearn || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-[20px] bg-black/5 p-5 font-bold"
    >
      {/* User Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {user.image ? (
              <Image 
                src={user.image} 
                alt={user.name} 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="flex items-center justify-center w-full h-full bg-gray-300 text-xl text-white">
                {user.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold font-urbanist text-gray-900">{user.name}</h3>
          </div>
        </div>
        <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
          Level {user.level}
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Knows:</span>
          <div className="flex gap-2 mt-1 flex-wrap">
            {knows.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Teaches:</span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {teaches.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Request Button */}
          <button
            onClick={() => onRequest(user.id)}
            className="px-4 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors"
          >
            Request
          </button>
        </div>
      </div>
    </motion.div>
  );
};
