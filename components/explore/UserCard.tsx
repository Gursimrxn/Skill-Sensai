import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getUserAvatarData, fillRandomTeachingSkills } from '@/lib/utils/avatarUtils';

/**
 * UserCard Component
 * 
 * Displays user information with randomized profile pictures.
 * Profile images are automatically assigned from public folder:
 * - /profile.png (pink - default)
 * - /profile-blue.png (blue)
 * - /profile-green.png (green) 
 * - /profile-yello.png (yellow)
 * 
 * Each user gets a consistent avatar and color scheme based on their ID.
 */

interface UserCardProps {
  user: any; // using API user object with skills and skillsToLearn
  index: number;
  onRequest: (userId: number) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, index, onRequest }) => {
  const knows = user.skills || [];
  const originalTeaches = user.skillsToLearn || [];
  
  // Auto-fill teaching skills if empty
  const teaches = fillRandomTeachingSkills(knows, originalTeaches);
  
  // Get randomized avatar data for this user - this will assign a consistent
  // profile image (pink, blue, green, or yellow) based on user ID
  const avatarData = getUserAvatarData(user.id || user._id || index);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-[20px] p-5 font-bold"
      style={{ backgroundColor: avatarData.colorScheme.bgColor }}
    >
      {/* User Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Profile Picture - Uses randomized colored avatars from public folder */}
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/20 shadow-sm">
            {user.image ? (
              <Image 
                src={user.image} 
                alt={user.name} 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <Image 
                src={avatarData.imagePath} 
                alt={user.name} 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
                priority={index < 3} // Prioritize loading for first few cards
              />
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
        <div className="flex items-start gap-2">
          <span className="text-sm text-gray-600 font-medium">Knows:</span>
          <div className="flex gap-2 flex-wrap">
            {knows.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-gray-800 text-sm font-medium shadow-sm"
                style={{ backgroundColor: avatarData.colorScheme.accentColor }}
              >
                {skill}
              </span>
            ))}
            {knows.length === 0 && (
              <span className="text-sm text-gray-500 italic">No skills listed</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="flex items-start gap-2">
            <span className="text-sm text-gray-600 font-medium">Teaches:</span>
            <div className="flex gap-2 flex-wrap">
              {teaches.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-white/80 text-gray-800 text-sm font-medium shadow-sm"
                >
                  {skill}
                </span>
              ))}
              {teaches.length === 0 && (
                <span className="text-sm text-gray-500 italic">No teaching skills listed</span>
              )}
            </div>
          </div>

          {/* Request Button - Uses the avatar's color scheme */}
          <button
            onClick={() => onRequest(user.id)}
            className="px-4 py-2 rounded-full text-white hover:opacity-80 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            style={{ backgroundColor: avatarData.colorScheme.requestColor }}
          >
            Request
          </button>
        </div>
      </div>
    </motion.div>
  );
};
