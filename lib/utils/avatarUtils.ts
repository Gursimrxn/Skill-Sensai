// Avatar utility functions for randomizing profile pictures

// Profile picture variations based on user colors - using images from public folder
export const AVATAR_VARIANTS = {
  // Pink/Default - Normal profile
  pink: '/profile.png', // Default pink profile image
  
  // Blue variation 
  blue: '/profile-blue.png', // Blue profile image
  
  // Green variation
  green: '/profile-green.png', // Green profile image
  
  // Orange/Yellow variation
  orange: '/profile-yello.png', // Yellow profile image (note: filename has typo but keeping as is)
  
  // Purple variation (fallback to pink since no purple image available)
  purple: '/profile.png', // Fallback to default pink
};

// Random skill pools for generating user data
export const SKILL_POOLS = {
  programming: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
    'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB', 'SQL', 'NoSQL', 'GraphQL'
  ],
  frameworks: [
    'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask',
    'Spring Boot', 'Laravel', 'Ruby on Rails', 'Flutter', 'React Native', 'Svelte'
  ],
  technologies: [
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Jenkins', 'CI/CD',
    'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch', 'Firebase', 'Microservices'
  ],
  design: [
    'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'Design Systems', 'Prototyping', 'User Research', 'Wireframing'
  ],
  data: [
    'Data Science', 'Machine Learning', 'Deep Learning', 'Data Analysis',
    'Statistics', 'Tableau', 'Power BI', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch'
  ],
  other: [
    'Project Management', 'Agile', 'Scrum', 'DevOps', 'Cybersecurity', 'Blockchain',
    'Game Development', 'Mobile Development', 'Web Development', 'API Development'
  ]
};

// Indian names for generating user data
export const INDIAN_NAMES = {
  first: [
    'Aarav', 'Aditya', 'Akash', 'Amit', 'Ananya', 'Anjali', 'Ankit', 'Ansh', 'Arjun', 'Arya',
    'Dhruv', 'Gaurav', 'Harsh', 'Ishaan', 'Karan', 'Kavya', 'Krish', 'Lakshmi', 'Manish', 'Maya',
    'Neha', 'Nisha', 'Pooja', 'Priya', 'Rahul', 'Raj', 'Ravi', 'Rohit', 'Sanjay', 'Shreya',
    'Siddharth', 'Simran', 'Suresh', 'Tanvi', 'Varun', 'Vedant', 'Vikram', 'Vishal', 'Yash', 'Zara'
  ],
  last: [
    'Agarwal', 'Bansal', 'Chandra', 'Desai', 'Gupta', 'Jain', 'Kapoor', 'Kumar', 'Malhotra', 'Mehta',
    'Nair', 'Patel', 'Reddy', 'Sharma', 'Singh', 'Sinha', 'Tiwari', 'Verma', 'Yadav', 'Shah',
    'Chopra', 'Mishra', 'Pandey', 'Saxena', 'Agrawal', 'Bhatt', 'Joshi', 'Khanna', 'Mittal', 'Rao'
  ]
};

// Color schemes for each avatar variant
export const AVATAR_COLOR_SCHEMES = {
  pink: {
    bgColor: '#ffebf0',      // Pink background
    cardColor: '#f9f9f9',    // Light gray card
    requestColor: '#ff88b0',  // Pink button
    accentColor: '#ff6ba0'   // Darker pink accent
  },
  blue: {
    bgColor: '#e6f0ff',      // Light blue background  
    cardColor: '#f9f9f9',    // Light gray card
    requestColor: '#66c7ff',  // Blue button
    accentColor: '#4db8ff'   // Darker blue accent
  },
  green: {
    bgColor: '#e6ffed',      // Light green background
    cardColor: '#f9f9f9',    // Light gray card  
    requestColor: '#5ae9aa',  // Green button
    accentColor: '#4cd964'   // Darker green accent
  },
  orange: {
    bgColor: '#fff4e6',      // Yellow/orange background
    cardColor: '#f9f9f9',    // Light gray card
    requestColor: '#ffb347',  // Orange button  
    accentColor: '#ff9500'   // Darker orange accent
  },
  purple: {
    bgColor: '#f0e6ff',      // Light purple background
    cardColor: '#f9f9f9',    // Light gray card
    requestColor: '#d4a5ff',  // Purple button
    accentColor: '#b885ff'   // Darker purple accent
  }
};

// Array of avatar variant keys for easy randomization
export const AVATAR_VARIANT_KEYS = Object.keys(AVATAR_VARIANTS) as Array<keyof typeof AVATAR_VARIANTS>;

/**
 * Get a random avatar variant key
 */
export function getRandomAvatarVariant(): keyof typeof AVATAR_VARIANTS {
  const randomIndex = Math.floor(Math.random() * AVATAR_VARIANT_KEYS.length);
  return AVATAR_VARIANT_KEYS[randomIndex];
}

/**
 * Get avatar image path by variant key
 */
export function getAvatarByVariant(variant: keyof typeof AVATAR_VARIANTS): string {
  return AVATAR_VARIANTS[variant];
}

/**
 * Get color scheme by variant key
 */
export function getColorSchemeByVariant(variant: keyof typeof AVATAR_VARIANTS) {
  return AVATAR_COLOR_SCHEMES[variant];
}

/**
 * Generate a consistent avatar variant for a user based on their ID
 * This ensures the same user always gets the same avatar
 */
export function getUserAvatarVariant(userId: string | number): keyof typeof AVATAR_VARIANTS {
  // Create a simple hash of the userId to ensure consistency
  const hash = Math.abs(hashCode(userId.toString()));
  const variantIndex = hash % AVATAR_VARIANT_KEYS.length;
  return AVATAR_VARIANT_KEYS[variantIndex];
}

/**
 * Get complete avatar data for a user (image path + color scheme)
 */
export function getUserAvatarData(userId: string | number) {
  const variant = getUserAvatarVariant(userId);
  return {
    variant,
    imagePath: getAvatarByVariant(variant),
    colorScheme: getColorSchemeByVariant(variant)
  };
}

/**
 * Simple hash function for consistent randomization
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Get a random avatar for new users or temporary display
 */
export function getRandomAvatar() {
  const variant = getRandomAvatarVariant();
  return {
    variant,
    imagePath: getAvatarByVariant(variant),
    colorScheme: getColorSchemeByVariant(variant)
  };
}

/**
 * Get random skills from all skill pools
 */
export function getRandomSkills(count: number = 2): string[] {
  const allSkills = Object.values(SKILL_POOLS).flat();
  const shuffled = [...allSkills].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get random skills from specific categories
 */
export function getRandomSkillsByCategory(categories: (keyof typeof SKILL_POOLS)[], count: number = 2): string[] {
  const skills = categories.flatMap(category => SKILL_POOLS[category]);
  const shuffled = [...skills].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate random Indian name
 */
export function getRandomIndianName(): string {
  const firstName = INDIAN_NAMES.first[Math.floor(Math.random() * INDIAN_NAMES.first.length)];
  const lastName = INDIAN_NAMES.last[Math.floor(Math.random() * INDIAN_NAMES.last.length)];
  return `${firstName} ${lastName}`;
}

/**
 * Fill empty teaching skills with random skills that complement known skills
 */
export function fillRandomTeachingSkills(knownSkills: string[], currentTeachingSkills: string[] = []): string[] {
  if (currentTeachingSkills.length > 0) {
    return currentTeachingSkills;
  }

  // If user knows programming languages, suggest frameworks
  const hasProgSkills = knownSkills.some(skill => 
    SKILL_POOLS.programming.includes(skill)
  );
  
  if (hasProgSkills) {
    // Add some frameworks and technologies
    const frameworks = getRandomSkillsByCategory(['frameworks', 'technologies'], 2);
    return [...knownSkills.slice(0, 1), ...frameworks]; // Include one known skill + new ones
  }

  // Otherwise, give them 2-3 random skills from their domain or complementary skills
  const randomTeaching = getRandomSkills(2);
  return randomTeaching;
}

/**
 * Generate a complete random Indian user with skills
 */
export function generateRandomIndianUser(id: number) {
  const name = getRandomIndianName();
  const avatarData = getUserAvatarData(id);
  
  // Generate 2-3 known skills
  const knownSkills = getRandomSkills(Math.floor(Math.random() * 2) + 2); // 2-3 skills
  
  // Generate teaching skills (either related to known skills or random)
  const teachingSkills = fillRandomTeachingSkills(knownSkills);
  
  return {
    id,
    name,
    level: Math.floor(Math.random() * 3) + 1, // Level 1-3
    avatar: avatarData.imagePath,
    knows: knownSkills,
    teaches: teachingSkills,
    bgColor: avatarData.colorScheme.bgColor,
    cardColor: avatarData.colorScheme.cardColor,
    requestColor: avatarData.colorScheme.requestColor
  };
}
