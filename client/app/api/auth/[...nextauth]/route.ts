import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          // Add any custom data you want to include in the JWT
          customData: {
            userId: user.id,
            email: user.email,
            // Add any other user data you want to sign
          },
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Send custom data to the client
      return {
        ...session,
        accessToken: token.accessToken,
        customData: token.customData,
      };
    },
  },
  session: {
    strategy: "jwt",
  },  
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 