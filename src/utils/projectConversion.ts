/**
 * Project Conversion Utilities
 */
import { ProjectI, projectStatus } from "@/src/components/screen/partner/projects/Project";
import { ProjectI as ModelProjectI } from "@/src/models/project";
import { currenciesArray } from "@/src/constants/currencies";
import { formatDateShort } from "@/src/utils/dateFormatters";

/**
 * Convert model project to UI project format
 * Maps the backend model format to the frontend display format
 * Uses same date formatting as detail page for consistency
 */
export function convertModelToUIProject(
  modelProject: ModelProjectI | Omit<ModelProjectI, "id" | "createdAt" | "updatedAt" | "partnerId">
): ProjectI {
  const currencyInfo = currenciesArray.find((c) => c.code === modelProject.currency);
  const currencySymbol = currencyInfo?.symbol || modelProject.currency;
  const formattedCost = `${currencySymbol}${modelProject.budget.toLocaleString()}`;

  // Format deadline date (same format as detail page)
  const formattedDeadline = formatDateShort(modelProject.deadline);

  // Map status to card status format
  const cardStatus: projectStatus = 
    modelProject.status === "in-progress" || modelProject.status === "published" ? "in-progress" :
    modelProject.status === "on-hold" ? "on-hold" :
    modelProject.status === "completed" ? "completed" : "in-progress";

  // Get ID from model project if available, otherwise use a temporary ID
  const projectId = 'id' in modelProject 
    ? (typeof modelProject.id === 'string' ? parseInt(modelProject.id, 10) : modelProject.id)
    : Date.now();

  return {
    id: projectId,
    title: modelProject.title,
    description: modelProject.description,
    skills: modelProject.skills,
    status: cardStatus,
    group: {
      name: "Not Assigned",
      members: [], // Empty until students/groups are assigned
    },
    expiryDate: formattedDeadline,
    cost: formattedCost,
  };
}

/**
 * Convert UI project to model project format
 */
export function convertUIToModelProject(
  uiProject: ProjectI,
  newProject: Omit<
    ModelProjectI,
    "id" | "createdAt" | "updatedAt" | "partnerId"
  >,
  partnerId: string = "current-partner-id"
): ModelProjectI {
  return {
    id: String(uiProject.id),
    partnerId,
    universityId: newProject.universityId,
    departmentId: newProject.departmentId,
    courseId: newProject.courseId,
    title: newProject.title,
    description: newProject.description,
    status: newProject.status,
    skills: newProject.skills,
    budget: newProject.budget,
    currency: newProject.currency,
    deadline: newProject.deadline,
    capacity: newProject.capacity,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}



