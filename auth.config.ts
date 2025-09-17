import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt-edge";
import { prisma } from "./prisma";

// Adding the callbacks for managing the session and token
export default {
  providers: [
    Github({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      authorize: async (credentials) => {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const email = credentials.email as string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user: any = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          throw new Error("No account found with this email.");
        } else {
          const isMatch = bcrypt.compareSync(
            credentials.password as string,
            user.hashedPassword
          );
          if (!isMatch) {
            throw new Error("Incorrect password.");
          }
        }

        // Return user object with role information
        return { ...user, role: user.role };
      },
    }),
  ],
  callbacks: {
    // Callback to manage the JWT token
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Callback to manage the session object
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  // Additional configuration can go here (e.g., pages)
  pages: {
    signIn: "/sign-in",
  },
} satisfies NextAuthConfig;
