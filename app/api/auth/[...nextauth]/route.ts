import NextAuth, { NextAuthOptions } from 'next-auth';
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
    async signIn({ user, account, profile }) {
      return true;
    },
    async session({ session, user }) {
      // Add custom fields to session from database user
      if (session?.user && user) {
        session.user.id = user.id;
        session.user.onboardingCompleted = (user as any).onboardingCompleted || false;
        session.user.level = (user as any).level || 1;
        session.user.skills = (user as any).skills || [];
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If there's a callbackUrl, use it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default redirect to onboarding
      return `${baseUrl}/onboarding`;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
