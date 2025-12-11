/**
 * Hook for filtering sidebar links by user role
 */
import { sidebarLinks } from "@/src/constants/sidebarLinks";
import type { LucideIcon } from "lucide-react";

type Role =
  | "partner"
  | "student"
  | "supervisor"
  | "university-admin"
  | "delegated-admin"
  | "super-admin";

export interface SidebarLinkData {
  title: string;
  iconComponent: LucideIcon;
  path: string;
  isFocused?: boolean;
}

/**
 * Get filtered sidebar links based on user role
 * Returns links with iconComponent (not JSX) - render in component
 */
export function useSidebarLinks(userRole?: Role): SidebarLinkData[] {
  if (!userRole) {
    const defaultCategory = sidebarLinks.find((cat) => cat.role === "partner");
    return defaultCategory?.links || [];
  }

  // Delegated-admin should see the same links as university-admin, but without "Delegated Access"
  const roleToLookup =
    userRole === "delegated-admin" ? "university-admin" : userRole;
  const category = sidebarLinks.find((cat) => cat.role === roleToLookup);
  const links = category?.links || [];

  // Filter out "Delegated Access" link for delegated-admin users
  if (userRole === "delegated-admin") {
    return links.filter((link) => link.title !== "Delegated Access");
  }

  return links;
}
