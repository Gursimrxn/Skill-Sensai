import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import { DIContainer } from '../di/container';

if (!process.env.MONGO_DB_URI) {
  throw new Error('MONGO_DB_URI environment variable is required');
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials are required');
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
}

const client = new MongoClient(process.env.MONGO_DB_URI);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const userService = DIContainer.getUserService();
          
          // Check if user exists
          let existingUser = await userService.findByEmail(user.email!);
          
          if (!existingUser) {
            // Create new user with Google data
            existingUser = await userService.create({
              email: user.email!,
              name: user.name!,
              image: user.image,
              provider: 'google',
              providerId: account.providerAccountId,
            });
          }
          
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    
    async session({ session }) {
      if (session.user?.email) {
        try {
          const userService = DIContainer.getUserService();
          const user = await userService.findByEmail(session.user.email);
          
          if (user && user._id != null) {
            session.user.id = typeof user._id === 'object' && 'toString' in user._id ? user._id.toString() : String(user._id);
            session.user.onboardingCompleted = user.onboardingCompleted;
            session.user.level = user.level;
            session.user.skills = user.skills;
          }
        } catch (error) {
          console.error('Error in session callback:', error);
        }
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Handle redirects after sign in
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.email) {
        try {
          const onboardingService = DIContainer.getOnboardingService();
          await onboardingService.initializeOnboarding(user.email);
        } catch (error) {
          console.error('Error initializing onboarding:', error);
        }
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
