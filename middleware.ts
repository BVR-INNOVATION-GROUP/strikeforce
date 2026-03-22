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
  "delegated-admin": ["/university-admin"],
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

type UserCookiePayload = {
  role?: string;
  orgType?: string;
};

/**
 * Get user payload from cookie (role + orgType for delegated-admin routing)
 */
function getUserCookiePayload(request: NextRequest): UserCookiePayload | null {
  const userCookie = request.cookies.get("user");
  if (!userCookie?.value) return null;
  try {
    const raw = userCookie.value.trim().startsWith("%7B")
      ? decodeURIComponent(userCookie.value)
      : userCookie.value;
    const user = JSON.parse(raw) as UserCookiePayload;
    return user?.role ? user : null;
  } catch {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value)) as UserCookiePayload;
      return user?.role ? user : null;
    } catch {
      return null;
    }
  }
}

/**
 * Check if user has access to a route
 */
function hasAccess(payload: UserCookiePayload | null, pathname: string): boolean {
  if (!payload?.role) return false;
  const role = payload.role;

  // Delegated admins use the app surface of whoever invited them (partner vs university org)
  if (role === "delegated-admin") {
    const ot = payload.orgType;
    if (ot === "PARTNER") return pathname.startsWith("/partner");
    if (ot === "UNIVERSITY") return pathname.startsWith("/university-admin");
    return (
      pathname.startsWith("/partner") || pathname.startsWith("/university-admin")
    );
  }

  const allowedRoutes = roleRoutes[role] || [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const userPayload = getUserCookiePayload(request);

  // If accessing a protected route without authentication, redirect to login
  if (!userPayload?.role && !isPublicRoute(pathname)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has access to the requested route
  if (userPayload?.role && !hasAccess(userPayload, pathname)) {
    let dashboardRoute = "/auth/login";
    if (userPayload.role === "delegated-admin") {
      if (userPayload.orgType === "PARTNER") dashboardRoute = "/partner";
      else if (userPayload.orgType === "UNIVERSITY") dashboardRoute = "/university-admin";
      else dashboardRoute = "/university-admin";
    } else {
      dashboardRoute = roleRoutes[userPayload.role]?.[0] || "/auth/login";
    }
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
