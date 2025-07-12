import React from 'react';
import { User } from '@/lib/data/explore-data';
import { motion } from 'framer-motion';

interface UserCardProps {
  user: User;
  index: number;
  onRequest: (userId: number) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, index, onRequest }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-[20px] p-5"
      style={{ backgroundColor: user.cardColor }}
    >
      {/* User Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-200 text-xl">
            {user.avatar}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{user.name}</h3>
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
            {user.knows.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: user.bgColor,
                  color: '#333'
                }}
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
              {user.teaches.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: user.bgColor,
                    color: '#333'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Request Button */}
          <button
            onClick={() => onRequest(user.id)}
            className="px-6 py-2 rounded-full text-white"
            style={{ backgroundColor: user.requestColor }}
          >
            Request
          </button>
        </div>
      </div>
    </motion.div>
  );
};
