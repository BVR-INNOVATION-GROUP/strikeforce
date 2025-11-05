/**
 * Sidebar navigation links configuration
 * Separated from Sidebar component to reduce size
 */
import {
    LayoutPanelTop, Briefcase, User, Settings, File, MessageCircle,
    Search, Users, FolderKanban, GraduationCap, Shield, ShieldCheck,
    ClipboardList, AlertCircle, BarChart3, FileText, UserPlus, Mail, BookOpen, Building2, UserCheck
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SidebarLinkI } from "@/src/components/base/SidebarLink";

type Role = "partner" | "student" | "supervisor" | "university-admin" | "super-admin";

export interface SideLinkCategory {
    role: Role;
    links: Omit<SidebarLinkI, 'icon'> & { iconComponent: LucideIcon }[];
}

/**
 * All sidebar links organized by role
 */
export const sidebarLinks: SideLinkCategory[] = [
    {
        role: "partner",
        links: [
            { title: "Dashboard", iconComponent: LayoutPanelTop, path: "/partner" },
            { title: "Projects", iconComponent: Briefcase, path: "/partner/projects" },
            { title: "Profile", iconComponent: User, path: "/partner/profile" },
            { title: "Settings", iconComponent: Settings, path: "/partner/settings" },
        ]
    },
    {
        role: "student",
        links: [
            { title: "Find", iconComponent: Search, path: "/student/find" },
            { title: "Projects", iconComponent: Briefcase, path: "/student/my-projects" },
            { title: "Groups", iconComponent: Users, path: "/student/groups" },
            { title: "Portfolio", iconComponent: FileText, path: "/student/portfolio" },
            { title: "Analytics", iconComponent: BarChart3, path: "/student/analytics" },
            { title: "Supervisor", iconComponent: UserPlus, path: "/student/supervisor-request" },
        ]
    },
    {
        role: "supervisor",
        links: [
            { title: "Dashboard", iconComponent: LayoutPanelTop, path: "/supervisor" },
            { title: "Projects", iconComponent: Briefcase, path: "/supervisor/projects" },
            { title: "Requests", iconComponent: ClipboardList, path: "/supervisor/requests" },
            { title: "Reviews", iconComponent: BarChart3, path: "/supervisor/reviews" },
            { title: "Profile", iconComponent: User, path: "/supervisor/profile" },
        ]
    },
    {
        role: "university-admin",
        links: [
            { title: "Dashboard", iconComponent: LayoutPanelTop, path: "/university-admin" },
            { title: "Departments", iconComponent: Building2, path: "/university-admin/departments" },
            { title: "Programmes", iconComponent: BookOpen, path: "/university-admin/courses" },
            { title: "Students", iconComponent: Users, path: "/university-admin/students" },
            { title: "Supervisors", iconComponent: UserCheck, path: "/university-admin/supervisors" },
            { title: "Screening", iconComponent: Search, path: "/university-admin/screening" },
            { title: "Offers", iconComponent: Briefcase, path: "/university-admin/offers" },
            { title: "Analytics", iconComponent: BarChart3, path: "/university-admin/analytics" },
            { title: "Disputes", iconComponent: AlertCircle, path: "/university-admin/disputes" },
        ]
    },
    {
        role: "super-admin",
        links: [
            { title: "Dashboard", iconComponent: LayoutPanelTop, path: "/super-admin" },
            { title: "Disputes", iconComponent: AlertCircle, path: "/super-admin/disputes" },
            { title: "Audit", iconComponent: FileText, path: "/super-admin/audit" },
            { title: "KYC", iconComponent: ShieldCheck, path: "/super-admin/kyc" },
            { title: "Profile", iconComponent: User, path: "/super-admin/profile" },
        ]
    }
];

