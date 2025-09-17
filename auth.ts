import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import authConfig from "./auth.config";

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: process.env.DATABASE_URL ? PrismaAdapter(prisma) : undefined,
  session: { strategy: "jwt" },
  ...authConfig,
});
