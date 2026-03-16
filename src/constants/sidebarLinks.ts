/**
 * Sidebar navigation links configuration
 * Separated from Sidebar component to reduce size
 */
import {
  LayoutPanelTop,
  Briefcase,
  User,
  Settings,
  Search,
  Users,
  GraduationCap,
  ClipboardList,
  AlertCircle,
  BarChart3,
  FileText,
  UserPlus,
  BookOpen,
  Building2,
  UserCheck,
  Handshake,
  FolderTree,
  MapPin,
  UserCog,
  DollarSign,
  Network,
  FileStack,
  Palette,
  HardDrive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SidebarLinkI } from "@/src/components/base/SidebarLink";

type Role =
  | "partner"
  | "student"
  | "supervisor"
  | "university-admin"
  | "super-admin";

export interface SideLinkCategory {
  role: Role;
  links: (Omit<SidebarLinkI, "icon"> & { iconComponent: LucideIcon; mobileTab?: boolean; mobileSidebarOnly?: boolean })[];
}

/**
 * All sidebar links organized by role
 */
export const sidebarLinks: SideLinkCategory[] = [
  {
    role: "partner",
    links: [
      { title: "Dashboard", iconComponent: LayoutPanelTop, path: "/partner" },
      {
        title: "Projects",
        iconComponent: Briefcase,
        path: "/partner/projects",
      },
      { title: "Profile", iconComponent: User, path: "/partner/profile" },
      { title: "Settings", iconComponent: Settings, path: "/partner/settings" },
    ],
  },
  {
    role: "student",
    links: [
      { title: "Find", iconComponent: Search, path: "/student/find", mobileTab: true },
      {
        title: "Projects",
        iconComponent: Briefcase,
        path: "/student/my-projects",
        mobileTab: true,
      },
      { title: "Groups", iconComponent: Users, path: "/student/groups", mobileTab: true },
      {
        title: "Portfolio",
        iconComponent: FileText,
        path: "/student/portfolio",
        mobileTab: true,
      },
      {
        title: "Analytics",
        iconComponent: BarChart3,
        path: "/student/analytics",
        mobileSidebarOnly: true,
      },
      {
        title: "Supervisor",
        iconComponent: UserPlus,
        path: "/student/supervisor-request",
        mobileSidebarOnly: true,
      },
    ],
  },
  {
    role: "supervisor",
    links: [
      {
        title: "Dashboard",
        iconComponent: LayoutPanelTop,
        path: "/supervisor",
      },
      {
        title: "Projects",
        iconComponent: Briefcase,
        path: "/supervisor/projects",
      },
      {
        title: "Requests",
        iconComponent: ClipboardList,
        path: "/supervisor/requests",
      },
      {
        title: "Reviews",
        iconComponent: BarChart3,
        path: "/supervisor/reviews",
      },
      { title: "Profile", iconComponent: User, path: "/supervisor/profile" },
    ],
  },
  {
    role: "university-admin",
    links: [
      {
        title: "Dashboard",
        iconComponent: LayoutPanelTop,
        path: "/university-admin",
      },
      {
        title: "Partners",
        iconComponent: Handshake,
        path: "/university-admin/partners",
      },
      {
        title: "Innovation hubs",
        iconComponent: Building2,
        path: "/university-admin/colleges",
      },
      {
        title: "Faculties",
        iconComponent: FolderTree,
        path: "/university-admin/departments",
      },
      {
        title: "Branches",
        iconComponent: MapPin,
        path: "/university-admin/branches",
      },
      {
        title: "Offers",
        iconComponent: Briefcase,
        path: "/university-admin/offers",
      },
      {
        title: "Analytics",
        iconComponent: BarChart3,
        path: "/university-admin/analytics",
      },
      {
        title: "Disputes",
        iconComponent: AlertCircle,
        path: "/university-admin/disputes",
      },
      {
        title: "Delegated Access",
        iconComponent: UserCog,
        path: "/university-admin/delegated-access",
      },
    ],
  },
  {
    role: "super-admin",
    links: [
      {
        title: "Dashboard",
        iconComponent: LayoutPanelTop,
        path: "/super-admin",
      },
      {
        title: "Partners",
        iconComponent: Briefcase,
        path: "/super-admin/partners",
      },
      {
        title: "Universities",
        iconComponent: GraduationCap,
        path: "/super-admin/universities",
      },
      {
        title: "Projects",
        iconComponent: Briefcase,
        path: "/super-admin/projects",
      },
      {
        title: "Finance",
        iconComponent: DollarSign,
        path: "/super-admin/finance",
      },
      {
        title: "Students",
        iconComponent: Users,
        path: "/super-admin/students",
      },
      {
        title: "Collaborations",
        iconComponent: Network,
        path: "/super-admin/collaborations",
      },
      {
        title: "Files",
        iconComponent: FileStack,
        path: "/super-admin/files",
      },
      {
        title: "Storage",
        iconComponent: HardDrive,
        path: "/super-admin/storage",
      },
      {
        title: "Surveys",
        iconComponent: ClipboardList,
        path: "/super-admin/surveys",
      },
      {
        title: "Users",
        iconComponent: Users,
        path: "/super-admin/users",
      },
      {
        title: "Branding",
        iconComponent: Palette,
        path: "/super-admin/branding",
      },
    ],
  },
];
