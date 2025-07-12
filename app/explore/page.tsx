'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';


// Import components
import { UserCard } from '@/components/explore/UserCard';
import { ChatSidebar } from '@/components/explore/ChatSidebar';
import { SearchBar } from '@/components/explore/SearchBar';
import { Header } from '@/components/explore/Header';

// Import data
import { 
  users, 
  chatMessages, 
  suggestedUsers,
  sampleRequests
} from '@/lib/data/explore-data';

export default function ExplorePage() {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState("Availability");
  const [chatInput, setChatInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  
  // State for requests
  const [sentRequests, setSentRequests] = useState(sampleRequests);
  const [receivedRequests, setReceivedRequests] = useState(sampleRequests);

  // Filter users based on search query
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        // Check if query matches any skills or name
        const matchesName = user.name.toLowerCase().includes(query.toLowerCase());
        const matchesKnows = user.knows.some(skill => 
          skill.toLowerCase().includes(query.toLowerCase())
        );
        const matchesTeaches = user.teaches.some(skill => 
          skill.toLowerCase().includes(query.toLowerCase())
        );
        return matchesName || matchesKnows || matchesTeaches;
      });
      setFilteredUsers(filtered);
    }
  };

  // Handle sending a request to connect with a user
  const handleRequest = (userId: number) => {
    console.log(`Request sent to user ${userId}`);
    // In a real app, this would call an API
  };

  // Handle sending a chat message
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      console.log("Sending message:", chatInput);
      setChatInput("");
      // In a real app, this would add the message to the chat
    }
  };

  // Handle accepting a request
  const handleAcceptRequest = (requestId: number) => {
    console.log(`Accepting request ${requestId}`);
    setReceivedRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'accepted' as const }
          : request
      )
    );
  };

  // Handle rejecting a request
  const handleRejectRequest = (requestId: number) => {
    console.log(`Rejecting request ${requestId}`);
    setReceivedRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected' as const }
          : request
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#fffbf7] font-urbanist">
      {/* Header */}
      <Header />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          {/* Greeting */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4 font-urbanist"
          >
            Hey 
          </motion.h2>

          {/* Search and Filter Section */}
          <SearchBar 
            searchQuery={searchQuery}
            availability={availability}
            onSearchQueryChange={handleSearchChange}
            onAvailabilityChange={(e) => setAvailability(e.target.value)}
          />

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((user, index) => (
              <UserCard
                key={user.id}
                user={user}
                index={index}
                onRequest={handleRequest}
              />
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar
          chatMessages={chatMessages}
          suggestedUsers={suggestedUsers}
          chatInput={chatInput}
          sentRequests={sentRequests}
          receivedRequests={receivedRequests}
          onChatInputChange={(e) => setChatInput(e.target.value)}
          onSendMessage={handleSendMessage}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
        />
      </div>
    </div>
  );
}
