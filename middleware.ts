// Importing necessary functions from the "next/server" module
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Importing the auth function from our auth.ts file
import { auth } from "@/auth.edge";

// Defining the protected routes with the roles allowed to access them, including dynamic segments
const protectedRoutes = [
  { path: "/admin/:path", roles: ["ADMIN"] }, // Only ADMIN can access routes starting with /admin/...
  { path: "/admin", roles: ["ADMIN"] }, // Also protect the base route for ADMIN
  { path: "/teacher/:path", roles: ["TEACHER"] }, // Only TEACHER can access routes starting with /teacher/...
  { path: "/teacher", roles: ["TEACHER"] }, // Also protect the base route for TEACHER
  { path: "/user/:path", roles: ["USER"] }, // Only USER can access routes starting with /user/...
  { path: "/user", roles: ["USER"] }, // Also protect the base route for USER
];

export default async function middleware(request: NextRequest) {
  // Get the session using the auth function
  const session = await auth();

  // Check if the request path is protected by comparing with the protectedRoutes array
  const isProtected = protectedRoutes.some((route) => {
    // Replace dynamic segments like :path with a regex that matches one segment,
    // and allow additional nested segments using (?:/.*)? at the end.
    const baseRegexString = route.path.replace(/:\w+/g, "[^/]+");
    const pattern = new RegExp(`^${baseRegexString}(?:/.*)?$`);
    return pattern.test(request.nextUrl.pathname);
  });

  if (isProtected) {
    // If the route is protected and there's no session, redirect to the login page
    if (!session) {
      const absoluteURL = new URL("/auth/login", request.nextUrl.origin);
      return NextResponse.redirect(absoluteURL.toString());
    }

    // Find the current route in the protectedRoutes array
    const currentRoute = protectedRoutes.find((route) => {
      const baseRegexString = route.path.replace(/:\w+/g, "[^/]+");
      const pattern = new RegExp(`^${baseRegexString}(?:/.*)?$`);
      return pattern.test(request.nextUrl.pathname);
    });

    // If the user role is not allowed for the current route, redirect to the unauthorized page
    if (
      currentRoute &&
      session.user &&
      session.user.role &&
      !currentRoute.roles.includes(session.user.role)
    ) {
      const absoluteURL = new URL("/unauthorized", request.nextUrl.origin);
      return NextResponse.redirect(absoluteURL.toString());
    }
  }

  // If the route is not protected or the user has access, continue to the next middleware or the requested page
  return NextResponse.next();
}

// Configuration to match all paths except for certain static files and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
