import React, { useState } from 'react';
import { ChatMessage, SuggestedUser, Request } from '@/lib/data/explore-data';
import { motion } from 'framer-motion';

interface ChatSidebarProps {
  chatMessages: ChatMessage[];
  suggestedUsers: SuggestedUser[];
  chatInput: string;
  sentRequests: Request[];
  receivedRequests: Request[];
  onChatInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onAcceptRequest: (requestId: number) => void;
  onRejectRequest: (requestId: number) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  
  suggestedUsers,
  chatInput,
  sentRequests,
  receivedRequests,
  onChatInputChange,
  onSendMessage,
  onAcceptRequest,
  onRejectRequest
}) => {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');

  return (
    <div className="w-120 flex flex-col gap-2 p-2 max-h-screen">
      {/* REQUESTS SECTION */}
      <div className="bg-black/10 rounded-[20px] flex flex-col flex-1 min-h-0">
        {/* Header with Tabs */}
        <div className="p-4 border-b border-gray-200/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 font-urbanist mb-2 text-3xl">Request</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                activeTab === 'sent'
                  ? 'bg-black/20 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                activeTab === 'received'
                  ? 'bg-pink-200 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Received
            </button>
          </div>
        </div>

        {/* Request List - Scrollable */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-0">
          {activeTab === 'received' && receivedRequests.map((request, index) => (
            <RequestCard
              key={request.id}
              request={request}
              index={index}
              type="received"
              onAccept={() => onAcceptRequest(request.id)}
              onReject={() => onRejectRequest(request.id)}
            />
          ))}
          
          {activeTab === 'sent' && sentRequests.map((request, index) => (
            <RequestCard
              key={request.id}
              request={request}
              index={index}
              type="sent"
            />
          ))}
        </div>
      </div>

      {/* CHAT SECTION */}
      <div className="bg-black/10 rounded-[20px] flex flex-col h-80 flex-shrink-0">
        {/* Chat Content - Scrollable */}
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="bg-black text-white p-2 rounded-2xl font-bold mb-2">
            <p className="text-xs font-urbanist">
              I need to learn Python and I can teach book keeping & available around 8pm Monday.
            </p>
          </div>
          
          {/* Suggested Users */}
          <div>
            <p className="text-xs text-gray-600 mb-1 font-urbanist font-bold">Here are some people who match your needs</p>
            <div className="grid grid-cols-2 gap-1">
              {suggestedUsers.slice(0, 4).map((user, idx) => (
                <div key={idx} className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                    {user.avatar}
                  </div>
                  <span className="text-xs font-bold text-gray-900 font-urbanist truncate">{user.name}</span>
                </div>
              ))}
            </div>
            <button className="text-xs text-gray-500 mt-1 hover:text-gray-700 font-bold">
              View all
            </button>
          </div>
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="p-2 border-t border-gray-200/50 flex-shrink-0">
          <div className="flex gap-1">
            <input
              type="text"
              value={chatInput}
              onChange={onChatInputChange}
              placeholder="I need to learn Python and I can teach book keeping"
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs font-urbanist font-bold"
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            />
            <button
              onClick={onSendMessage}
              className="px-2 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RequestCardProps {
  request: Request;
  index: number;
  type: 'sent' | 'received';
  onAccept?: () => void;
  onReject?: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, index, type, onAccept, onReject }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-black/10 rounded-xl p-3 border-black/10"
    >
      {/* User Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
            {request.user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 font-urbanist text-sm truncate">{request.user.name}</h4>
          </div>
        </div>
        <div className="bg-black text-white px-2 py-1 rounded-full text-xs font-bold flex-shrink-0">
          Level {request.user.level}
        </div>
      </div>

      {/* Skills - Horizontal Layout */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm text-gray-500 font-normal flex-shrink-0">Skill Offered:</span>
          <span className="px-2 py-2 bg-pink-200 text-gray-800 rounded-full text-sm font-urbanist truncate">
            {request.skillOffered}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm text-gray-500 font-normal flex-shrink-0">Skill Wanted:</span>
          <span className="px-2 py-2 bg-pink-200 text-gray-800 rounded-full text-sm font-urbanist truncate">
            {request.skillWanted}
          </span>
        </div>
      </div>

      {/* Action Buttons - Only show for received requests */}
      {type === 'received' && (
        <div className="flex gap-2">
          <button
            onClick={onReject}
            className="flex-1 p-1.5 rounded-full border border-gray-200 hover:bg-red-50 transition-colors flex items-center justify-center"
          >
            <div className="w-4 h-4 text-red-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          <button
            onClick={onAccept}
            className="flex-1 p-1.5 rounded-full border border-gray-200 hover:bg-green-50 transition-colors flex items-center justify-center"
          >
            <div className="w-4 h-4 text-green-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
      )}
    </motion.div>
  );
};
