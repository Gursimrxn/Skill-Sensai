// Data for the explore page

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

// Sample user data based on the image
export const users: User[] = [
  {
    id: 1,
    name: "Aisha Patel",
    level: 1,
    avatar: "👩🏻",
    knows: ["Python", "Data Science"],
    teaches: ["Python", "Machine Learning"],
    bgColor: "#ffebf0",    // Pink background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#ff88b0" // Pink button
  },
  {
    id: 2,
    name: "Marcus Johnson", 
    level: 1,
    avatar: "👨🏼",
    knows: ["JavaScript", "React"],
    teaches: ["JavaScript", "Web Dev"],
    bgColor: "#fff4e6",    // Yellow/orange background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#ffb347" // Orange button
  },
  {
    id: 3,
    name: "Sophia Chen",
    level: 1,
    avatar: "👨🏻",
    knows: ["Java", "Spring"],
    teaches: ["Java", "Backend"],
    bgColor: "#e6f7ff",    // Light blue background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#66c7ff" // Blue button
  },
  {
    id: 4,
    name: "Raj Mehta",
    level: 1,
    avatar: "🧑🏽",
    knows: ["UI/UX", "Figma"],
    teaches: ["Design", "Prototyping"],
    bgColor: "#e6ffed",    // Light green background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#4cd964" // Green button
  },
  {
    id: 5,
    name: "Emma Thompson",
    level: 1,
    avatar: "👨🏼",
    knows: ["DevOps", "Docker"],
    teaches: ["Kubernetes", "CI/CD"],
    bgColor: "#fff9e6",    // Light yellow background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#ffda79" // Yellow button
  },
  {
    id: 6,
    name: "Alex Rodriguez",
    level: 1,
    avatar: "🧑🏻‍💻",
    knows: ["C++", "Algorithms"],
    teaches: ["Data Structures", "Problem Solving"],
    bgColor: "#f0e6ff",    // Light purple background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#d4a5ff" // Purple button
  },
  {
    id: 7,
    name: "Priya Sharma",
    level: 1,
    avatar: "👨🏽",
    knows: ["Flutter", "Dart"],
    teaches: ["Mobile Dev", "UI Design"],
    bgColor: "#e6fff2",    // Mint green background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#5ae9aa" // Green button
  },
  {
    id: 8,
    name: "David Kim",
    level: 1,
    avatar: "👨🏻",
    knows: ["TypeScript", "Next.js"],
    teaches: ["React", "Full Stack"],
    bgColor: "#e6f0ff",    // Very light blue background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#80bdff" // Light blue button
  }
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

// Suggested users data
export const suggestedUsers: SuggestedUser[] = [
  { id: 1, name: "Aisha Patel", avatar: "👩🏻", skill: "Data Science" },
  { id: 6, name: "Alex Rodriguez", avatar: "🧑🏻‍💻", skill: "Algorithms" },
  { id: 2, name: "Marcus Johnson", avatar: "🧑🏼", skill: "JavaScript" },
  { id: 7, name: "Priya Sharma", avatar: "👨🏽", skill: "Mobile Dev" }
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
