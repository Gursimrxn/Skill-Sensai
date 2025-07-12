import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      onboardingCompleted?: boolean;
      level?: number;
      skills?: string[];
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    onboardingCompleted?: boolean;
    level?: number;
    skills?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    onboardingCompleted?: boolean;
    level?: number;
    skills?: string[];
  }
}