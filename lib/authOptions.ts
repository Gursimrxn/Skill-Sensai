import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_DB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id = user.id;
        session.user.onboardingCompleted = (user as { onboardingCompleted?: boolean }).onboardingCompleted || false;
        session.user.level = (user as { level?: number }).level || 1;
        session.user.skills = (user as { skills?: string[] }).skills || [];
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow custom callback URLs to work
      if (url.startsWith(baseUrl)) return url;
      // Default redirect to /explore
      return `${baseUrl}/explore`;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
