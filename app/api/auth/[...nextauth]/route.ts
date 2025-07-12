import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import { DIContainer } from '../../../../lib/di/container';

const client = new MongoClient(process.env.MONGO_DB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google') {
          const userService = DIContainer.getUserService();
          
          // Check if user exists
          let existingUser = await userService.findByEmail(user.email!);
          
          if (!existingUser) {
            // Create new user
            existingUser = await userService.createUser({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
            });
          }
        }
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const userService = DIContainer.getUserService();
        const user = await userService.findByEmail(session.user.email);
        
        if (user) {
          session.user.id = (user as any)._id.toString();
          session.user.onboardingCompleted = user.onboardingCompleted;
          session.user.level = user.level;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Custom redirect logic after sign in
      const userService = DIContainer.getUserService();
      
      try {
        // Extract email from URL parameters or session
        const urlParams = new URL(url, baseUrl);
        const callbackUrl = urlParams.searchParams.get('callbackUrl');
        
        // For now, always redirect to onboarding check
        // The onboarding page will handle the redirection logic
        return `${baseUrl}/onboarding`;
      } catch (error) {
        console.error('Redirect error:', error);
        return `${baseUrl}/onboarding`;
      }
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
