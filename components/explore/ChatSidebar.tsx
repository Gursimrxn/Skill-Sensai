import React from 'react';
import { ChatMessage, SuggestedUser } from '@/lib/data/explore-data';

interface ChatSidebarProps {
  chatMessages: ChatMessage[];
  suggestedUsers: SuggestedUser[];
  chatInput: string;
  onChatInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chatMessages,
  suggestedUsers,
  chatInput,
  onChatInputChange,
  onSendMessage
}) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 font-urbanist">Request</h3>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {chatMessages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">🤖</span>
              </div>
              <div className="bg-gray-900 text-white px-4 py-2 rounded-2xl rounded-tl-sm max-w-[200px] font-urbanist">
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Users */}
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3 font-urbanist">Here are some people who match your needs</p>
          <div className="space-y-2">
            {suggestedUsers.map((user, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {user.avatar}
                </div>
                <span className="text-sm font-medium text-gray-900 font-urbanist">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={onChatInputChange}
            placeholder="I need to learn Python and I can teach book keeping & available around 8pm Monday."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-urbanist"
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          />
          <button
            onClick={onSendMessage}
            className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
