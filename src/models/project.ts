/**
 * Project model - represents partner projects posted to universities
 */

export type ProjectStatus =
  | "draft"
  | "published"
  | "in-progress"
  | "on-hold"
  | "completed"
  | "cancelled";

export interface ProjectI {
  id: number;
  partnerId: number;
  universityId: number;
  departmentId: number;
  courseId: number;
  supervisorId?: number;
  title: string;
  description: string; // Kept for backward compatibility
  summary?: string; // Project summary
  challengeStatement?: string; // Project challenge/opportunity statement
  scopeActivities?: string; // Project scope/activities (what students must work on)
  deliverablesMilestones?: string; // Deliverables/milestones (tracked by days/weeks)
  teamStructure?: "individuals" | "groups" | "both"; // Allowed team structure
  duration?: string; // Project duration (e.g., "12 weeks", "3 months")
  expectations?: string; // Expectations
  status: ProjectStatus;
  skills: string[];
  budget:
    | number
    | { Currency?: string; Value?: number; currency?: string; value?: number }; // Backend returns Budget object
  currency: string;
  deadline: string;
  capacity: number; // Max number of students/groups
  attachments?: string[]; // URLs to attached files
  partnerSignature?: string; // Partner signature data URL
  universityAdminSignature?: string; // University admin signature data URL
  mouUrl?: string; // URL to MOU PDF on Cloudinary
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentI {
  id: number;
  universityId: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
  collegeId?: number | null;
  collegeName?: string;
}

export interface CourseI {
  id: number;
  departmentId: number;
  name: string;
  createdAt: string;
}
