'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Admin interface types
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  level: number;
  skills: string[];
  skillsToLearn: string[];
  onboardingCompleted: boolean;
  isBanned?: boolean;
  createdAt: string;
}

interface SkillDescription {
  id: string;
  userId: string;
  userName: string;
  skill: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  reportCount: number;
  createdAt: string;
}

interface Swap {
  id: string;
  requester: { name: string; email: string };
  responder: { name: string; email: string };
  skillsOffered: string[];
  skillsRequested: string[];
  status: 'pending' | 'accepted' | 'cancelled' | 'completed';
  createdAt: string;
}

interface Message {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'maintenance' | 'feature' | 'warning';
  targetUsers: 'all' | 'active' | 'new';
  sentAt?: string;
  status: 'draft' | 'sent';
}

const ADMIN_EMAIL = 'sgursimranmatharu@gmail.com';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    pendingSkills: 0,
    totalSwaps: 0,
    pendingSwaps: 0,
    messagesSent: 0
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Mock data - replace with real API calls
  const [skillDescriptions, setSkillDescriptions] = useState<SkillDescription[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  const [swaps, setSwaps] = useState<Swap[]>([]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg1',
      title: 'Platform Maintenance Scheduled',
      content: 'We will be performing scheduled maintenance on January 20th from 2:00 AM to 4:00 AM UTC. The platform will be temporarily unavailable during this time.',
      type: 'maintenance',
      targetUsers: 'all',
      status: 'draft'
    }
  ]);

  const [newMessage, setNewMessage] = useState<Partial<Message>>({
    title: '',
    content: '',
    type: 'announcement',
    targetUsers: 'all',
    status: 'draft'
  });

  // Utility functions
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // API functions
  const loadStats = useCallback(async () => {
    // Calculate stats from existing data
    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.isBanned && u.onboardingCompleted).length;
    const bannedUsers = users.filter(u => u.isBanned).length;
    const pendingSkills = skillDescriptions.filter(s => s.status === 'pending').length;
    const totalSwaps = swaps.length;
    const pendingSwaps = swaps.filter(s => s.status === 'pending').length;
    const messagesSent = messages.filter(m => m.status === 'sent').length;

    setStats({
      totalUsers,
      activeUsers,
      bannedUsers,
      pendingSkills,
      totalSwaps,
      pendingSwaps,
      messagesSent
    });
  }, [users, skillDescriptions, swaps, messages]);

  useEffect(() => {
    setLoading(false);
    loadStats();
    
    // Load data based on active tab
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'swaps') {
      loadSwaps();
    } else if (activeTab === 'skills') {
      loadSkills();
    } else if (activeTab === 'messages') {
      loadMessages();
    }
  }, [activeTab, loadStats]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadSwaps = async () => {
    try {
      const response = await fetch('/api/admin/swaps');
      if (response.ok) {
        const data = await response.json();
        setSwaps(data.swaps);
      }
    } catch (error) {
      console.error('Error loading swaps:', error);
    }
  };

  const loadSkills = async () => {
    try {
      const response = await fetch('/api/admin/skills');
      if (response.ok) {
        const data = await response.json();
        setSkillDescriptions(data.skills);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Check admin access
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#fffbf7] flex items-center justify-center">
        <div className="text-2xl font-urbanist">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#fffbf7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Handler functions
  const handleSkillAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/skills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: id, action })
      });

      if (response.ok) {
        setSkillDescriptions(prev => 
          prev.map(skill => 
            skill.id === id 
              ? { ...skill, status: action === 'approve' ? 'approved' : 'rejected' }
              : skill
          )
        );
        showNotification('success', `Skill ${action}d successfully!`);
        loadStats(); // Refresh stats
      } else {
        showNotification('error', `Failed to ${action} skill`);
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      showNotification('error', 'An error occurred while updating the skill');
    }
  };

  const handleBanUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: id, 
          action: user.isBanned ? 'unban' : 'ban',
          reason: user.isBanned ? undefined : 'Admin action'
        })
      });

      if (response.ok) {
        setUsers(prev => 
          prev.map(user => 
            user.id === id 
              ? { ...user, isBanned: !user.isBanned }
              : user
          )
        );
        showNotification('success', `User ${user.isBanned ? 'unbanned' : 'banned'} successfully!`);
        loadStats(); // Refresh stats
      } else {
        showNotification('error', `Failed to ${user.isBanned ? 'unban' : 'ban'} user`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('error', 'An error occurred while updating the user');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.title || !newMessage.content) return;
    
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage({
          title: '',
          content: '',
          type: 'announcement',
          targetUsers: 'all',
          status: 'draft'
        });
        showNotification('success', 'Platform message sent successfully!');
        loadStats(); // Refresh stats
      } else {
        showNotification('error', 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('error', 'An error occurred while sending the message');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', count: 0 },
    { id: 'skills', label: 'Skill Descriptions', count: skillDescriptions.filter(s => s.status === 'pending').length },
    { id: 'users', label: 'User Management', count: users.filter(u => u.isBanned).length },
    { id: 'swaps', label: 'Swap Monitoring', count: swaps.filter(s => s.status === 'pending').length },
    { id: 'messages', label: 'Platform Messages', count: messages.filter(m => m.status === 'draft').length }
  ];

  return (
    <div className="min-h-screen bg-[#fffbf7] font-urbanist">
      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-600 text-white' :
            notification.type === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>
              {notification.type === 'success' ? 
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg> :
               notification.type === 'error' ? 
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg> : 
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>}
            </span>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Skill Sensai"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600 mt-1">Platform Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-600">{session.user?.email}</p>
              </div>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Admin"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex gap-2">
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-red-100 text-red-800'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="text-3xl text-blue-600">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-green-600">
                    {stats.activeUsers} active users
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Skills</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.pendingSkills}</p>
                    </div>
                    <div className="text-3xl text-orange-600">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-orange-600">
                    Require review
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Swaps</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalSwaps}</p>
                    </div>
                    <div className="text-3xl text-green-600">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-blue-600">
                    {stats.pendingSwaps} pending
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Messages Sent</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.messagesSent}</p>
                    </div>
                    <div className="text-3xl text-purple-600">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-purple-600">
                    Platform communications
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent User Registrations</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center gap-3">
                        {user.image && (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Level {user.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">User Activity Rate</span>
                      <span className="text-sm font-medium text-green-600">
                        {Math.round((stats.activeUsers / stats.totalUsers) * 100) || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.round((stats.activeUsers / stats.totalUsers) * 100) || 0}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Skill Approval Rate</span>
                      <span className="text-sm font-medium text-blue-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Swap Success Rate</span>
                      <span className="text-sm font-medium text-purple-600">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('skills')}
                    className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl mb-2 text-orange-600">
                      <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Review Skills</p>
                    <p className="text-xs text-gray-500">{stats.pendingSkills} pending</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl mb-2 text-blue-600">
                      <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Manage Users</p>
                    <p className="text-xs text-gray-500">{stats.totalUsers} total</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('swaps')}
                    className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl mb-2 text-green-600">
                      <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Monitor Swaps</p>
                    <p className="text-xs text-gray-500">{stats.pendingSwaps} pending</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl mb-2">📢</div>
                    <p className="text-sm font-medium text-gray-900">Send Message</p>
                    <p className="text-xs text-gray-500">Communicate</p>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Skill Descriptions Tab */}
          {activeTab === 'skills' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Skill Descriptions</h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="all">All Skills</option>
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {skillDescriptions
                    .filter(skill => {
                      const matchesFilter = filter === 'all' || skill.status === filter;
                      const matchesSearch = skill.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          skill.userName.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesFilter && matchesSearch;
                    })
                    .map((skill) => (
                    <div key={skill.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(skill.status)}`}>
                              {skill.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">by {skill.userName}</p>
                          {skill.reportCount > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                </svg>
                                {skill.reportCount} reports
                              </span>
                            </div>
                          )}
                        </div>
                        {skill.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSkillAction(skill.id, 'approve')}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => handleSkillAction(skill.id, 'reject')}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                              </svg>
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                        {skill.description}
                      </p>
                      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                        <span>Created: {new Date(skill.createdAt).toLocaleString()}</span>
                        <span>ID: {skill.id}</span>
                      </div>
                    </div>
                  ))}
                  {skillDescriptions.filter(s => {
                    const matchesFilter = filter === 'all' || s.status === filter;
                    const matchesSearch = s.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        s.userName.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesFilter && matchesSearch;
                  }).length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4 text-gray-400">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <p className="text-gray-500">No skill descriptions found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search term</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active Users</option>
                      <option value="banned">Banned Users</option>
                      <option value="new">New Users</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {users
                    .filter(user => {
                      const matchesFilter = filter === 'all' || 
                                          (filter === 'active' && !user.isBanned) ||
                                          (filter === 'banned' && user.isBanned) ||
                                          (filter === 'new' && new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesFilter && matchesSearch;
                    })
                    .map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{user.name}</h3>
                              {user.isBanned && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                                  </svg>
                                  Banned
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Level {user.level}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                {user.skills.length} skills
                              </span>
                              <span className="text-xs text-gray-500">
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {/* View user details */}}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                              user.isBanned
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {user.isBanned ? (
                              <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                Unban
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                                </svg>
                                Ban
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      {user.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {user.skills.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                          {user.skills.length > 5 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{user.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {users.filter(user => {
                    const matchesFilter = filter === 'all' || 
                                        (filter === 'active' && !user.isBanned) ||
                                        (filter === 'banned' && user.isBanned) ||
                                        (filter === 'new' && new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesFilter && matchesSearch;
                  }).length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4 text-gray-400">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                      </div>
                      <p className="text-gray-500">No users found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search term</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Swap Monitoring Tab */}
          {activeTab === 'swaps' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Skill Swap Monitoring</h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="all">All Swaps</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {swaps
                    .filter(swap => filter === 'all' || swap.status === filter)
                    .map((swap) => (
                    <div key={swap.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{swap.requester.name}</span>
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                              <span className="font-semibold text-gray-900">{swap.responder.name}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(swap.status)}`}>
                              {swap.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 font-medium flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                                </svg>
                                Offering:
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {swap.skillsOffered.map((skill, idx) => (
                                  <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600 font-medium flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 13a1 1 0 112 0v-3.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L9 9.414V13z" clipRule="evenodd"/>
                                </svg>
                                Requesting:
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {swap.skillsRequested.map((skill, idx) => (
                                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                              </svg>
                              {swap.requester.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                              </svg>
                              {swap.responder.email}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(swap.createdAt).toLocaleDateString()}
                          </span>
                          {swap.status === 'pending' && (
                            <button
                              onClick={() => {/* Handle intervention */}}
                              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs hover:bg-orange-200 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                              </svg>
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {swaps.filter(swap => filter === 'all' || swap.status === filter).length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4 text-gray-400">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <p className="text-gray-500">No skill swaps found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Platform Messages Tab */}
          {activeTab === 'messages' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Create New Message */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📢 Send Platform Message</h2>
                
                {/* Message Templates */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Templates:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <button
                      onClick={() => setNewMessage({
                        title: 'Platform Maintenance Scheduled',
                        content: 'We will be performing scheduled maintenance on [DATE] from [START TIME] to [END TIME] UTC. The platform will be temporarily unavailable during this time.',
                        type: 'maintenance',
                        targetUsers: 'all',
                        status: 'draft'
                      })}
                      className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-lg mb-1">🔧</div>
                      <p className="text-xs font-medium">Maintenance</p>
                    </button>
                    <button
                      onClick={() => setNewMessage({
                        title: 'New Feature Release',
                        content: 'We\'re excited to announce a new feature that will enhance your skill-swapping experience! [FEATURE DESCRIPTION]',
                        type: 'feature',
                        targetUsers: 'all',
                        status: 'draft'
                      })}
                      className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-lg mb-1">🚀</div>
                      <p className="text-xs font-medium">New Feature</p>
                    </button>
                    <button
                      onClick={() => setNewMessage({
                        title: 'Welcome to Skill Sensai!',
                        content: 'Welcome to our platform! Start by completing your profile and exploring available skill swaps.',
                        type: 'announcement',
                        targetUsers: 'new',
                        status: 'draft'
                      })}
                      className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-lg mb-1 text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <p className="text-xs font-medium">Welcome</p>
                    </button>
                    <button
                      onClick={() => setNewMessage({
                        title: 'Important Security Update',
                        content: 'Please update your account security settings and review your recent activity.',
                        type: 'warning',
                        targetUsers: 'all',
                        status: 'draft'
                      })}
                      className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-lg mb-1 text-orange-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <p className="text-xs font-medium">Security</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        value={newMessage.title || ''}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Message title..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={newMessage.type || 'announcement'}
                          onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="announcement">Announcement</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="feature">New Feature</option>
                          <option value="warning">Warning</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                        <select
                          value={newMessage.targetUsers || 'all'}
                          onChange={(e) => setNewMessage(prev => ({ ...prev, targetUsers: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="all">All Users</option>
                          <option value="active">Active Users</option>
                          <option value="new">New Users</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                    <textarea
                      value={newMessage.content || ''}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Message content..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Use [DATE], [TIME], [USERNAME] as placeholders that will be replaced automatically.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Target audience: <span className="font-medium">
                        {newMessage.targetUsers === 'all' ? 'All users' : 
                         newMessage.targetUsers === 'active' ? 'Active users only' : 'New users only'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewMessage({
                          title: '',
                          content: '',
                          type: 'announcement',
                          targetUsers: 'all',
                          status: 'draft'
                        })}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        🗑️ Clear
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.title || !newMessage.content}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        📤 Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Message History</h2>
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{message.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            message.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {message.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(message.type)}`}>
                            {message.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{message.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Target: {message.targetUsers}</span>
                        {message.sentAt && (
                          <span>Sent: {new Date(message.sentAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
