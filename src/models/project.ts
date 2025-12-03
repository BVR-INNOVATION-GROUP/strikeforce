/**
 * Project model - represents partner projects posted to universities
 */

export type ProjectStatus = "draft" | "published" | "in-progress" | "on-hold" | "completed" | "cancelled";

export interface ProjectI {
  id: number;
  partnerId: number;
  universityId: number;
  departmentId: number;
  courseId: number;
  supervisorId?: number;
  title: string;
  description: string;
  status: ProjectStatus;
  skills: string[];
  budget: number | { Currency?: string; Value?: number; currency?: string; value?: number }; // Backend returns Budget object
  currency: string;
  deadline: string;
  capacity: number; // Max number of students/groups
  attachments?: string[]; // URLs to attached files
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentI {
  id: number;
  universityId: number;
  name: string;
  createdAt: string;
}

export interface CourseI {
  id: number;
  departmentId: number;
  name: string;
  createdAt: string;
}


