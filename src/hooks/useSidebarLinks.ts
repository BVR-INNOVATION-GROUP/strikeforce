/**
 * Hook for filtering sidebar links by user role
 */
import { sidebarLinks } from "@/src/constants/sidebarLinks";
import type { LucideIcon } from "lucide-react";

type Role = "partner" | "student" | "supervisor" | "university-admin" | "super-admin";

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
        const defaultCategory = sidebarLinks.find(cat => cat.role === "partner");
        return defaultCategory?.links || [];
    }

    const category = sidebarLinks.find(cat => cat.role === userRole);
    return category?.links || [];
}

