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
  desc: string; // Kept for backward compatibility
  summary: string;
  challengeStatement: string;
  scopeActivities: string;
  teamStructure: "individuals" | "groups" | "both" | "";
  duration: string;
  expectations: string;
  budget: string;
  deadline: string;
  capacity: string;
  selectedSkills: string[];
  attachments?: string[]; // File paths from uploaded files
  partnerSignature?: string | null; // Partner signature data URL
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
    !data.summary ||
    !data.challengeStatement ||
    !data.scopeActivities ||
    !data.teamStructure ||
    !data.duration ||
    !data.expectations ||
    !data.budget ||
    !data.deadline ||
    !data.capacity ||
    data.selectedSkills.length === 0
  ) {
    throw new Error("All required fields must be filled");
  }

  // Filter out "__OTHERS__" marker from skills - it's just a UI marker, not an actual skill
  const cleanedSkills = data.selectedSkills.filter((skill) => skill !== "__OTHERS__");

  // Use summary as description if desc is empty (desc field is kept for backward compatibility but not used in new form)
  // Description is required by backend validation, so we use summary which is always filled
  const description = data.desc?.trim() || data.summary?.trim() || "";

  // Build base project object
  const project: any = {
    universityId: Number(data.university.value),
    departmentId: Number(data.department.value),
    title: data.title.trim(),
    description: description, // Use summary if desc is empty
    summary: data.summary.trim(),
    challengeStatement: data.challengeStatement.trim(),
    scopeActivities: data.scopeActivities.trim(),
    teamStructure: data.teamStructure as "individuals" | "groups" | "both",
    duration: data.duration.trim(),
    expectations: data.expectations.trim(),
    status: "draft",
    skills: cleanedSkills,
    budget: parseFloat(data.budget) || 0,
    currency: data.currency.value as string,
    deadline: new Date(data.deadline).toISOString(),
    capacity: parseInt(data.capacity) || 1,
    attachments: data.attachments || [], // Include uploaded file paths
    partnerSignature: data.partnerSignature || null, // Partner signature
  };

  // Only include courseId if course is selected (not null and value is valid)
  if (data.course && data.course.value) {
    const courseIdNum = Number(data.course.value);
    if (courseIdNum > 0) {
      project.courseId = courseIdNum;
    }
  }

  return project;
}






