/**
 * Route Protector Component - Client-side route protection
 * Ensures users can only access routes appropriate for their role
 */
"use client";

import React, { useEffect } from "react";
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

  // Check if pathname matches any of the role's allowed routes
  const allowedRoutes = roleRoutes[userRole] || [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Route Protector component
 * Wraps pages to ensure only authorized users can access them
 */
export default function RouteProtector({ children, allowedRoles }: Props) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow public routes
    if (isPublicRoute(pathname)) {
      return;
    }

    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated || !user) {
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }

    // Check if user has access to this route
    if (!hasAccess(user.role, pathname, allowedRoles)) {
      // User doesn't have access - redirect to their dashboard
      const dashboardRoute = roleRoutes[user.role]?.[0] || "/auth/login";
      router.push(dashboardRoute);
      return;
    }
  }, [user, isAuthenticated, pathname, router, allowedRoles]);

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

