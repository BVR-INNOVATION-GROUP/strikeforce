/**
 * Project Form Submission Logic
 */
import { ProjectI } from "@/src/models/project";
import { OptionI } from "@/src/components/core/Select";

export interface ProjectFormData {
  university: OptionI | undefined;
  department: OptionI | null;
  course: OptionI | null;
  currency: OptionI | null;
  title: string;
  desc: string;
  budget: string;
  deadline: string;
  capacity: string;
  selectedSkills: string[];
  attachments?: string[]; // File paths from uploaded files
}

/**
 * Build project object from form data
 * @param data - Form data including uploaded attachment paths
 */
export function buildProjectFromForm(data: ProjectFormData): Omit<
  ProjectI,
  "id" | "createdAt" | "updatedAt" | "partnerId"
> {
  if (
    !data.university ||
    !data.department ||
    !data.course ||
    !data.currency ||
    !data.title ||
    !data.desc ||
    !data.budget ||
    !data.deadline ||
    !data.capacity ||
    data.selectedSkills.length === 0
  ) {
    throw new Error("All required fields must be filled");
  }

  return {
    universityId: Number(data.university.value),
    departmentId: Number(data.department.value),
    courseId: Number(data.course.value),
    title: data.title.trim(),
    description: data.desc.trim(),
    status: "draft",
    skills: data.selectedSkills,
    budget: parseFloat(data.budget) || 0,
    currency: data.currency.value as string,
    deadline: new Date(data.deadline).toISOString(),
    capacity: parseInt(data.capacity) || 1,
    attachments: data.attachments || [], // Include uploaded file paths
  };
}






