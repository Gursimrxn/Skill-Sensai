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

// Sample user data based on the image
export const users: User[] = [
  {
    id: 1,
    name: "Aisha Patel",
    level: 1,
    avatar: "👩🏻",
    knows: ["Python", "Python"],
    teaches: ["Python", "Python"],
    bgColor: "#ffebf0",    // Pink background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#ff88b0" // Pink button
  },
  {
    id: 2,
    name: "Marcus Johnson", 
    level: 1,
    avatar: "👨🏼",
    knows: ["Python", "Python"],
    teaches: ["Python", "Python"],
    bgColor: "#fff4e6",    // Yellow/orange background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#ffb347" // Orange button
  },
  {
    id: 3,
    name: "Sophia Chen",
    level: 1,
    avatar: "👨🏻",
    knows: ["Python", "Python"],
    teaches: ["Python", "Python"],
    bgColor: "#e6f7ff",    // Light blue background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#66c7ff" // Blue button
  },
  {
    id: 4,
    name: "Raj Mehta",
    level: 1,
    avatar: "🧑🏽",
    knows: ["Python", "Python"],
    teaches: ["Python", "Python"],
    bgColor: "#e6ffed",    // Light green background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#4cd964" // Green button
  },
  {
    id: 5,
    name: "Emma Thompson",
    level: 1,
    avatar: "👨🏼",
    knows: ["Python", "Python"],
    teaches: ["Python", "Python"],
    bgColor: "#fff9e6",    // Light yellow background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#ffda79" // Yellow button
  },
  {
    id: 6,
    name: "Alex Rodriguez",
    level: 1,
    avatar: "🧑🏻‍💻",
    knows: ["Python", "Python"],
    teaches: ["Python", "Python"],
    bgColor: "#f0e6ff",    // Light purple background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#d4a5ff" // Purple button
  },
  {
    id: 7,
    name: "Priya Sharma",
    level: 1,
    avatar: "👨🏽",
    knows: ["Python", "Python"],
    teaches: ["Python", "Python"],
    bgColor: "#e6fff2",    // Mint green background
    cardColor: "#f9f9f9",  // Light gray card
    requestColor: "#5ae9aa" // Green button
  },
  {
    id: 8,
    name: "David Kim",
    level: 1,
    avatar: "👨🏻",
    knows: ["Python", "Python"],
    teaches: ["Python", "Python"],
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
    text: "I'm looking to learn Python for data science",
    isBot: false
  },
  {
    id: 3,
    text: "Great! I'll find some experts in Python and data science for you",
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
  { id: 1, name: "Aisha Patel", avatar: "👩🏻", skill: "Python" },
  { id: 6, name: "Alex Rodriguez", avatar: "🧑🏻‍💻", skill: "Python" },
  { id: 2, name: "Marcus Johnson", avatar: "🧑🏼", skill: "Python" },
  { id: 7, name: "Priya Sharma", avatar: "👨🏽", skill: "Python" }
];
