/**
 * Next.js Middleware - Role-based route protection
 * Ensures users can only access routes appropriate for their role
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define role-based route mappings
const roleRoutes: Record<string, string[]> = {
  partner: ["/partner"],
  student: ["/student"],
  supervisor: ["/supervisor"],
  "university-admin": ["/university-admin"],
  "super-admin": ["/super-admin"],
};

// Public routes that don't require authentication
const publicRoutes = [
  "/", // Landing page
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-account",
  "/auth/invite",
  "/auth/onboarding",
];

/**
 * Check if a route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  // Exact match for root path
  if (pathname === "/") {
    return true;
  }
  // Check if pathname starts with any public route
  return publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Get user role from request (in production, from session/token)
 * For now, we'll check cookies or headers for user info
 */
function getUserRole(request: NextRequest): string | null {
  // In production, this would read from session or JWT token
  // For development, check if we have a user cookie
  const userCookie = request.cookies.get("user");
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      return user.role || null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Check if user has access to a route
 */
function hasAccess(role: string | null, pathname: string): boolean {
  if (!role) return false;

  // Check if pathname matches unknown of the role's allowed routes
  const allowedRoutes = roleRoutes[role] || [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get user role
  const userRole = getUserRole(request);

  // If accessing a protected route without authentication, redirect to login
  if (!userRole && !isPublicRoute(pathname)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has access to the requested route
  if (userRole && !hasAccess(userRole, pathname)) {
    // User doesn't have access - redirect to their dashboard
    const dashboardRoute = roleRoutes[userRole]?.[0] || "/auth/login";
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};





