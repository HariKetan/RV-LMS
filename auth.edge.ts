import NextAuth from "next-auth";

export const {
  auth,
} = NextAuth({
  session: { strategy: "jwt" },
  // Keep providers empty for middleware; JWT verification doesn't require them
  providers: [],
});


