'use client';

import { useState, useEffect } from 'react';
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

  // Mock data - replace with real API calls
  const [skillDescriptions, setSkillDescriptions] = useState<SkillDescription[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      skill: 'React',
      description: 'Advanced React development with hooks and context. I can teach state management and component optimization.',
      status: 'pending',
      reportCount: 0,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      skill: 'Python',
      description: 'This is some spam content with inappropriate links and promotional material that should be rejected.',
      status: 'pending',
      reportCount: 3,
      createdAt: '2024-01-15T11:00:00Z'
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: 'user1',
      email: 'john@example.com',
      name: 'John Doe',
      image: '/profile.png',
      level: 5,
      skills: ['React', 'JavaScript', 'TypeScript'],
      skillsToLearn: ['Python', 'Machine Learning'],
      onboardingCompleted: true,
      isBanned: false,
      createdAt: '2024-01-10T08:00:00Z'
    },
    {
      id: 'user2',
      email: 'spammer@example.com',
      name: 'Spam User',
      level: 1,
      skills: ['Spam'],
      skillsToLearn: [],
      onboardingCompleted: true,
      isBanned: false,
      createdAt: '2024-01-14T15:30:00Z'
    }
  ]);

  const [swaps, setSwaps] = useState<Swap[]>([
    {
      id: 'swap1',
      requester: { name: 'Alice Johnson', email: 'alice@example.com' },
      responder: { name: 'Bob Wilson', email: 'bob@example.com' },
      skillsOffered: ['React', 'JavaScript'],
      skillsRequested: ['Python', 'Django'],
      status: 'pending',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: 'swap2',
      requester: { name: 'Carol Brown', email: 'carol@example.com' },
      responder: { name: 'David Lee', email: 'david@example.com' },
      skillsOffered: ['Python'],
      skillsRequested: ['React'],
      status: 'accepted',
      createdAt: '2024-01-14T14:00:00Z'
    },
    {
      id: 'swap3',
      requester: { name: 'Eve Davis', email: 'eve@example.com' },
      responder: { name: 'Frank Miller', email: 'frank@example.com' },
      skillsOffered: ['Vue.js'],
      skillsRequested: ['Angular'],
      status: 'cancelled',
      createdAt: '2024-01-13T11:30:00Z'
    }
  ]);

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
  }, [activeTab]);

  // API functions
  const loadStats = async () => {
    // Calculate stats from existing data
    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.isBanned).length;
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
  };

  // API functions
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
          <p className="text-gray-600">You don't have permission to access this page.</p>
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
      }
    } catch (error) {
      console.error('Error updating skill:', error);
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
      }
    } catch (error) {
      console.error('Error updating user:', error);
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
        console.log('Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
    { id: 'dashboard', label: 'Dashboard', icon: '📊', count: 0 },
    { id: 'skills', label: 'Skill Descriptions', icon: '🎯', count: skillDescriptions.filter(s => s.status === 'pending').length },
    { id: 'users', label: 'User Management', icon: '👥', count: users.filter(u => u.isBanned).length },
    { id: 'swaps', label: 'Swap Monitoring', icon: '🔄', count: swaps.filter(s => s.status === 'pending').length },
    { id: 'messages', label: 'Platform Messages', icon: '📢', count: messages.filter(m => m.status === 'draft').length }
  ];

  return (
    <div className="min-h-screen bg-[#fffbf7] font-urbanist">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Skill Sensai"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Platform Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-600">{session.user?.email}</p>
              </div>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Admin"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
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
                  <span className="text-2xl">{tab.icon}</span>
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
                    <div className="text-3xl">👥</div>
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
                    <div className="text-3xl">🎯</div>
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
                    <div className="text-3xl">🔄</div>
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
                    <div className="text-3xl">📢</div>
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
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="text-sm font-medium text-gray-900">Review Skills</p>
                    <p className="text-xs text-gray-500">{stats.pendingSkills} pending</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl mb-2">👥</div>
                    <p className="text-sm font-medium text-gray-900">Manage Users</p>
                    <p className="text-xs text-gray-500">{stats.totalUsers} total</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('swaps')}
                    className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl mb-2">🔄</div>
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
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                ⚠️ {skill.reportCount} reports
                              </span>
                            </div>
                          )}
                        </div>
                        {skill.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSkillAction(skill.id, 'approve')}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleSkillAction(skill.id, 'reject')}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                            >
                              ✗ Reject
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
                      <div className="text-4xl mb-4">📝</div>
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
                              <span className="text-gray-500 text-lg">👤</span>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{user.name}</h3>
                              {user.isBanned && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  🚫 Banned
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
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              user.isBanned
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {user.isBanned ? '✓ Unban' : '🚫 Ban'}
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
                      <div className="text-4xl mb-4">👥</div>
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
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skill Swap Monitoring</h2>
                <div className="space-y-4">
                  {swaps.map((swap) => (
                    <div key={swap.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">
                              {swap.requester.name} ↔ {swap.responder.name}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(swap.status)}`}>
                              {swap.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Offering: {swap.skillsOffered.join(', ')}</p>
                            <p>Requesting: {swap.skillsRequested.join(', ')}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(swap.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
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
                <h2 className="text-xl font-bold text-gray-900 mb-4">Send Platform Message</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newMessage.title || ''}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Message title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={newMessage.content || ''}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Message content..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={newMessage.type || 'announcement'}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as any }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="all">All Users</option>
                        <option value="active">Active Users</option>
                        <option value="new">New Users</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.title || !newMessage.content}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Message
                  </button>
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
