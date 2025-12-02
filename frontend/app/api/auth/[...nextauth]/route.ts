import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          scope: [
            'openid',
            'email',
            'profile',
          ].join(' '),
        },
      },
    }),
    // Development-only: Simple test login for localhost
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        name: 'Test Account',
        credentials: {
          email: { label: "Email", type: "email", placeholder: "test@localhost.dev" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          // Accept any login in development
          if (credentials?.email && credentials?.password) {
            return {
              id: 'dev-user-' + Date.now(),
              email: credentials.email,
              name: credentials.email.split('@')[0],
              image: null,
            };
          }
          return null;
        },
      })
    ] : []),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // After successful Google sign-in, create/update user in our backend
      if (account?.provider === 'google' || account?.provider === 'credentials') {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
          console.log('[NextAuth] Syncing user to backend:', apiUrl);
          
          // Step 1: Sync user to backend
          const response = await fetch(`${apiUrl}/auth/sync-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[NextAuth] Failed to sync user to backend:', response.status, errorText);
            // In development, allow login even if backend sync fails
            if (process.env.NODE_ENV === 'development') {
              console.warn('[NextAuth] Allowing login in development despite backend sync failure');
              user.id = 'dev-user-' + Date.now();
              return true;
            }
            return false;
          }

          const data = await response.json();
          user.id = data.id;

          // Step 2: Generate backend JWT for API requests
          const jwtResponse = await fetch(`${apiUrl}/auth/generate-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: data.id }),
          });

          if (jwtResponse.ok) {
            const jwtData = await jwtResponse.json();
            user.backendToken = jwtData.token;
          }
        } catch (error) {
          console.error('[NextAuth] Error syncing user to backend:', error);
          // In development, allow login even if backend sync fails
          if (process.env.NODE_ENV === 'development') {
            console.warn('[NextAuth] Allowing login in development despite error');
            user.id = 'dev-user-' + Date.now();
            return true;
          }
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.backendToken = user.backendToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.backendToken = token.backendToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
