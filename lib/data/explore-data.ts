// Data for the explore page
import { generateRandomIndianUser } from '@/lib/utils/avatarUtils';

// Types
export interface User {
  id: number;
  name: string;
  level: number;
  avatar: string;
  knows: string[];
  teaches: string[];
  bgColor: string;  // Background color for tags
  cardColor: string; // Background color for the card
  requestColor: string; // Color for request button
}

export interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
}

export interface SuggestedUser {
  id: number;
  name: string;
  avatar: string;
  skill: string;
}

export interface Request {
  id: number;
  user: User;
  skillOffered: string;
  skillWanted: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

// Sample user data with diverse Indian names and filled teaching skills
export const users: User[] = [
  {
    id: 1,
    name: "Priya Sharma",
    level: 1,
    avatar: "/profile.png",
    knows: ["Python", "Data Science"],
    teaches: ["Python", "Machine Learning", "Data Analysis"],
    bgColor: "#ffebf0",    // Pink background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#ff88b0" // Pink button
  },
  {
    id: 2,
    name: "Arjun Patel", 
    level: 2,
    avatar: "/profile-blue.png",
    knows: ["JavaScript", "React"],
    teaches: ["JavaScript", "React", "Web Development"],
    bgColor: "#e6f0ff",    // Light blue background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#66c7ff" // Blue button
  },
  {
    id: 3,
    name: "Kavya Reddy",
    level: 1,
    avatar: "/profile-green.png",
    knows: ["Java", "Spring Boot"],
    teaches: ["Java", "Spring Boot", "Backend Development"],
    bgColor: "#e6ffed",    // Light green background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#5ae9aa" // Green button
  },
  {
    id: 4,
    name: "Rohit Gupta",
    level: 3,
    avatar: "/profile-yello.png",
    knows: ["UI/UX Design", "Figma"],
    teaches: ["UI/UX Design", "Figma", "Design Systems"],
    bgColor: "#fff4e6",    // Light yellow background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#ffb347" // Yellow button
  },
  {
    id: 5,
    name: "Ananya Singh",
    level: 2,
    avatar: "/profile.png",
    knows: ["DevOps", "Docker", "AWS"],
    teaches: ["DevOps", "Docker", "Kubernetes", "Cloud Architecture"],
    bgColor: "#ffebf0",    // Pink background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#ff88b0" // Pink button
  },
  {
    id: 6,
    name: "Vikram Mehta",
    level: 2,
    avatar: "/profile-blue.png",
    knows: ["C++", "Algorithms", "Data Structures"],
    teaches: ["C++", "Data Structures", "Competitive Programming"],
    bgColor: "#e6f0ff",    // Light blue background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#66c7ff" // Blue button
  },
  {
    id: 7,
    name: "Shreya Agarwal",
    level: 1,
    avatar: "/profile-green.png",
    knows: ["Flutter", "Dart", "Mobile Development"],
    teaches: ["Flutter", "Dart", "Mobile App Development"],
    bgColor: "#e6ffed",    // Light green background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#5ae9aa" // Green button
  },
  {
    id: 8,
    name: "Karan Joshi",
    level: 2,
    avatar: "/profile-yello.png",
    knows: ["TypeScript", "Next.js", "Node.js"],
    teaches: ["TypeScript", "Next.js", "Full Stack Development"],
    bgColor: "#fff4e6",    // Light yellow background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#ffb347" // Yellow button
  },
  // Additional Indian users with random generation
  ...Array.from({ length: 12 }, (_, index) => generateRandomIndianUser(9 + index))
];

// Chat messages data
export const chatMessages: ChatMessage[] = [
  {
    id: 1,
    text: "Hi there! How can I help you find the right mentor today?",
    isBot: true
  },
  {
    id: 2,
    text: "I need to learn programming skills for my new job",
    isBot: false
  },
  {
    id: 3,
    text: "Great! I'll find experts in various programming skills for you",
    isBot: true
  },
  {
    id: 4,
    text: "Here are some people who match your needs",
    isBot: true
  }
];

// Suggested users data with Indian names
export const suggestedUsers: SuggestedUser[] = [
  { id: 1, name: "Priya Sharma", avatar: "/profile.png", skill: "Data Science" },
  { id: 6, name: "Vikram Mehta", avatar: "/profile-blue.png", skill: "Algorithms" },
  { id: 2, name: "Arjun Patel", avatar: "/profile-blue.png", skill: "JavaScript" },
  { id: 7, name: "Shreya Agarwal", avatar: "/profile-green.png", skill: "Mobile Dev" }
];

// Sample request data
export const sampleRequests: Request[] = [
  {
    id: 1,
    user: users[0], // Aisha Patel
    skillOffered: "Python",
    skillWanted: "Python",
    status: 'pending',
    timestamp: "2025-07-12T10:00:00Z"
  },
  {
    id: 2,
    user: users[0], // Aisha Patel  
    skillOffered: "Python",
    skillWanted: "Python",
    status: 'pending',
    timestamp: "2025-07-12T09:30:00Z"
  },
  {
    id: 3,
    user: users[0], // Aisha Patel
    skillOffered: "Python", 
    skillWanted: "Python",
    status: 'pending',
    timestamp: "2025-07-12T09:00:00Z"
  }
];
