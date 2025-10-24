import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
          scope: [
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/drive.readonly',
          ].join(' '),
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // After successful Google sign-in, create/update user in our backend
      if (account?.provider === 'google') {
        try {
          // Step 1: Sync user to backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/sync-user`, {
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
            console.error('Failed to sync user to backend');
            return false;
          }

          const data = await response.json();
          user.id = data.id;

          // Step 2: Generate backend JWT for API requests
          const jwtResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/generate-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: data.id }),
          });

          if (jwtResponse.ok) {
            const jwtData = await jwtResponse.json();
            user.backendToken = jwtData.token;

            // Step 3: Store Google OAuth tokens for syncing
            if (account.access_token && account.refresh_token) {
              const expiresAt = account.expires_at
                ? new Date(account.expires_at * 1000).toISOString()
                : new Date(Date.now() + 3600 * 1000).toISOString();

              const scopes = account.scope ? account.scope.split(' ') : [];

              await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/connect/google`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwtData.token}`,
                },
                body: JSON.stringify({
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                  expiresAt,
                  scopes,
                }),
              }).catch(err => {
                console.error('Failed to store Google OAuth tokens:', err);
              });
            }
          }
        } catch (error) {
          console.error('Error syncing user to backend:', error);
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
