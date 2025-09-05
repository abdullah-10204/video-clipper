import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Replace with real DB lookup
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        // Temporary hardcoded users for testing
        const users = [
          {
            id: "1",
            email: "studio@test.com",
            password: "1234",
            role: "STUDIO",
          },
          {
            id: "2",
            email: "agency@test.com",
            password: "1234",
            role: "AGENCY",
          },
          {
            id: "3",
            email: "editor@test.com",
            password: "1234",
            role: "EDITOR",
          },
        ];

        const user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          return user; // NextAuth adds this to session
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
