import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist Discord data in the token
      if (account && profile) {
        token.accessToken = account.access_token;
        token.discordId = profile.id;
        token.username = (profile as any).username;
        token.discriminator = (profile as any).discriminator;
      }
      return token;
    },
    async session({ session, token }) {
      // Check for mock session in development
      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        const mockSession = localStorage.getItem('mock-session');
        if (mockSession) {
          try {
            const parsed = JSON.parse(mockSession);
            return parsed;
          } catch (e) {
            // Invalid mock session, remove it
            localStorage.removeItem('mock-session');
          }
        }
      }

      // Send properties to the client
      if (token && session.user) {
        (session as any).accessToken = token.accessToken;
        (session.user as any).discordId = token.discordId as string;
        (session.user as any).username = token.username as string;
        (session.user as any).discriminator = token.discriminator as string;
      }
      return session;
    }
  },
  pages: {
    error: '/auth/error', // Custom error page
  },
  debug: process.env.NODE_ENV === 'development',
})
