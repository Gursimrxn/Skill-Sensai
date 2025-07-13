'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Import components
import { UserCard } from '@/components/explore/UserCard';
import { ChatSidebar } from '@/components/explore/ChatSidebar';
import { SearchBar } from '@/components/explore/SearchBar';
import { Header } from '@/components/explore/Header';

export default function ExplorePage() {
  const { status } = useSession();
  const router = useRouter();

  // State for search and filters - MUST be at the top level
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState("Availability");
  const [chatInput, setChatInput] = useState("");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // State for connection requests
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);

  // Fetch users from search API
  const fetchUsers = async (query: string = '') => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/user/search?skills=${encodeURIComponent(query)}`);
      const data = await resp.json();
      setUsersList(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change and call API
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchUsers(query);
  };

  // Handle sending a new connection request
  const handleRequest = async (userId: number) => {
    try {
      const resp = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId.toString(), connectionType: 'skill-swap', message: '', skillsOffered: [], skillsRequested: [] })
      });
      if (resp.ok) {
        await refreshConnections();
      }
    } catch (err) {
      console.error('Error sending connection request:', err);
    }
  };

  // Handle sending a chat message
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      console.log("Sending message:", chatInput);
      setChatInput("");
      // In a real app, this would add the message to the chat
    }
  };

  // Handle accepting a connection request
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const resp = await fetch(`/api/connections/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      });
      if (resp.ok) {
        await refreshConnections();
      }
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  // Handle rejecting a connection request
  const handleRejectRequest = async (requestId: number) => {
    try {
      const resp = await fetch(`/api/connections/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' })
      });
      if (resp.ok) {
        await refreshConnections();
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  // Functions to fetch connection lists
  const fetchConnections = async (type: 'sent' | 'received') => {
    try {
      const resp = await fetch(`/api/connections?type=${type}`);
      const data = await resp.json();
      if (type === 'sent') setSentRequests(data.connections || []);
      else setReceivedRequests(data.connections || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
    }
  };

  // Refresh both sent and received lists
  const refreshConnections = useCallback(() => {
    fetchConnections('sent');
    fetchConnections('received');
  }, []);

  // Initial load
  useEffect(() => { 
    if (status === 'authenticated') {
      fetchUsers(); 
    }
  }, [status]);

  // Load connections on mount
  useEffect(() => { 
    if (status === 'authenticated') {
      refreshConnections(); 
    }
  }, [refreshConnections, status]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#fffbf7] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }
  
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
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersList.map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  index={index}
                  onRequest={handleRequest}
                />
              ))}
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar
          chatMessages={[]}
          suggestedUsers={[]}
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
