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
  mobileTab?: boolean;
  mobileSidebarOnly?: boolean;
}

/**
 * Get filtered sidebar links based on user role
 * Returns links with iconComponent (not JSX) - render in component
 * @param delegatedOrgType — for role delegated-admin: organization type (PARTNER vs UNIVERSITY) sets which app surface they use
 */
export function useSidebarLinks(
  userRole?: Role,
  delegatedOrgType?: string | null
): SidebarLinkData[] {
  if (!userRole) {
    const defaultCategory = sidebarLinks.find((cat) => cat.role === "partner");
    return defaultCategory?.links || [];
  }

  if (userRole === "delegated-admin") {
    const surface: Role =
      delegatedOrgType === "PARTNER" ? "partner" : "university-admin";
    const category = sidebarLinks.find((cat) => cat.role === surface);
    const links = category?.links || [];
    return links.filter((link) => link.title !== "Delegated Access");
  }

  const category = sidebarLinks.find((cat) => cat.role === userRole);
  return category?.links || [];
}
