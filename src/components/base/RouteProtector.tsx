/**
 * Route Protector Component - Client-side route protection
 * Ensures users can only access routes appropriate for their role
 */
"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store";
import { UserRole } from "@/src/models/user";

// Define role-based route mappings
const roleRoutes: Record<UserRole, string[]> = {
  partner: ["/partner"],
  student: ["/student"],
  supervisor: ["/supervisor"],
  "university-admin": ["/university-admin"],
  "super-admin": ["/super-admin"],
};

// Public routes that don't require authentication
const publicRoutes = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-account",
  "/auth/invite",
  "/auth/onboarding",
];

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Check if a route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if user has access to a route
 */
function hasAccess(userRole: UserRole | null, pathname: string, allowedRoles?: UserRole[]): boolean {
  if (!userRole) return false;

  // If specific roles are allowed, check against them
  if (allowedRoles && allowedRoles.length > 0) {
    return allowedRoles.includes(userRole);
  }

  // Check if pathname matches unknown of the role's allowed routes
  const allowedRoutes = roleRoutes[userRole] || [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Route Protector component
 * Wraps pages to ensure only authorized users can access them
 */
export default function RouteProtector({ children, allowedRoles }: Props) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const lastRedirectRef = useRef<string | null>(null);

  // Memoize allowedRoles string for stable comparison
  const allowedRolesKey = useMemo(() => {
    return allowedRoles ? allowedRoles.sort().join(',') : '';
  }, [allowedRoles]);

  // Wait for hydration before checking auth (prevents false redirects on page load)
  // Only wait for hydration in test/dev mode (localStorage persistence)
  // In production (NextAuth), session is handled server-side, so we can proceed
  const useTestAuth = process.env.NEXT_PUBLIC_USE_TEST_AUTH === "true" || process.env.NODE_ENV === "development";
  const isHydrated = !useTestAuth || _hasHydrated === true; // Skip hydration check in production

  useEffect(() => {
    // Don't check auth until store has hydrated from localStorage
    if (!isHydrated) {
      return;
    }
    // Allow public routes
    if (isPublicRoute(pathname)) {
      lastRedirectRef.current = null;
      return;
    }

    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated || !user) {
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      // Only redirect if not already on login page and haven't redirected to this URL
      if (pathname !== "/auth/login" && lastRedirectRef.current !== loginUrl) {
        lastRedirectRef.current = loginUrl;
        router.push(loginUrl);
      }
      return;
    }

    // Check if user has access to this route
    if (!hasAccess(user.role, pathname, allowedRoles)) {
      // User doesn't have access - redirect to their dashboard
      const dashboardRoute = roleRoutes[user.role]?.[0] || "/auth/login";
      // Only redirect if not already on the target route and haven't redirected to this route
      if (pathname !== dashboardRoute && lastRedirectRef.current !== dashboardRoute) {
        lastRedirectRef.current = dashboardRoute;
        router.push(dashboardRoute);
      }
      return;
    }

    // Reset redirect tracking if we have access
    lastRedirectRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, isAuthenticated, pathname, allowedRolesKey, isHydrated]);

  // Show loading while hydrating (prevents flash of redirect)
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  // If on public route or user has access, render children
  if (isPublicRoute(pathname) || (user && hasAccess(user.role, pathname, allowedRoles))) {
    return <>{children}</>;
  }

  // Show loading state while checking access
  return (
    <div className="flex items-center justify-center h-full">
      <p>Loading...</p>
    </div>
  );
}

