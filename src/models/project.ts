/**
 * Project model - represents partner projects posted to universities
 */
import { ProjectI as BaseProjectI } from "../components/screen/partner/projects/Project";

export type ProjectStatus = "draft" | "published" | "in-progress" | "on-hold" | "completed" | "cancelled";

export interface ProjectI {
  id: number;
  partnerId: string;
  universityId: string;
  departmentId: string;
  courseId: string;
  supervisorId?: string;
  title: string;
  description: string;
  status: ProjectStatus;
  skills: string[];
  budget: number;
  currency: string;
  deadline: string;
  capacity: number; // Max number of students/groups
  attachments?: string[]; // URLs to attached files
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentI {
  id: string;
  universityId: string;
  name: string;
  createdAt: string;
}

export interface CourseI {
  id: string;
  departmentId: string;
  name: string;
  createdAt: string;
}


