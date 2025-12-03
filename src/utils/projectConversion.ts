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
  // Handle budget - backend returns Budget object {Currency: string, Value: uint} or separate budget/currency
  let budgetValue: number = 0;
  let currencyValue: string = '';
  
  // Check if budget is an object (Budget struct from backend)
  if (modelProject.budget && typeof modelProject.budget === 'object' && !Array.isArray(modelProject.budget)) {
    const budgetObj = modelProject.budget as any;
    // Handle both uppercase (GORM) and lowercase field names
    budgetValue = budgetObj.Value !== undefined ? budgetObj.Value : (budgetObj.value !== undefined ? budgetObj.value : 0);
    currencyValue = budgetObj.Currency || budgetObj.currency || '';
  } else if (typeof modelProject.budget === 'number') {
    // Budget is already a number
    budgetValue = modelProject.budget;
    currencyValue = modelProject.currency || '';
  } else {
    // Fallback: try to parse as number
    budgetValue = typeof modelProject.budget === 'string' ? parseFloat(modelProject.budget) || 0 : 0;
    currencyValue = modelProject.currency || '';
  }
  
  const currencyInfo = currenciesArray.find((c) => c.code === currencyValue);
  const currencySymbol = currencyInfo?.symbol || currencyValue;
  const formattedCost = `${currencySymbol}${budgetValue.toLocaleString()}`;

  // Format deadline date (same format as detail page)
  const formattedDeadline = formatDateShort(modelProject.deadline);

  // Map status to card status format
  const cardStatus: projectStatus = 
    modelProject.status === "in-progress" || modelProject.status === "published" ? "in-progress" :
    modelProject.status === "on-hold" ? "on-hold" :
    modelProject.status === "completed" ? "completed" : "in-progress";

  // Get ID from model project - backend returns ID from gorm.Model
  // GORM's Model.ID is serialized as "ID" (uppercase) in JSON by default
  // Check both 'id' (lowercase) and 'ID' (uppercase) to handle different response formats
  let projectId: number;
  
  // First check for lowercase 'id' (what frontend expects)
  if ('id' in modelProject && modelProject.id !== undefined && modelProject.id !== null) {
    const idValue = modelProject.id;
    projectId = typeof idValue === 'string' ? parseInt(idValue, 10) : idValue;
  } 
  // Then check for uppercase 'ID' (what GORM returns)
  else if ('ID' in modelProject) {
    const backendId = (modelProject as any).ID;
    if (backendId !== undefined && backendId !== null) {
      projectId = typeof backendId === 'string' ? parseInt(backendId, 10) : backendId;
    } else {
      console.error('Project ID is null/undefined:', modelProject);
      throw new Error('Project must have a valid ID');
    }
  } 
  // If neither exists, this is an error
  else {
    console.error('Project missing ID field:', modelProject);
    throw new Error('Project must have an ID field');
  }
  
  // Validate that projectId is a valid number (not a timestamp)
  if (isNaN(projectId) || projectId <= 0 || projectId > 2147483647) {
    console.error('Invalid project ID:', projectId, 'from project:', modelProject);
    throw new Error(`Invalid project ID: ${projectId}. Expected a valid database ID, not a timestamp.`);
  }

  // Ensure skills is always an array of strings
  let skillsArray: string[] = [];
  if (Array.isArray(modelProject.skills)) {
    skillsArray = modelProject.skills.map(skill => {
      if (typeof skill === 'string') {
        return skill;
      }
      // If skill is an object, try to extract a meaningful string
      if (typeof skill === 'object' && skill !== null) {
        return (skill as any).name || (skill as any).label || String(skill);
      }
      return String(skill);
    });
  } else if (typeof modelProject.skills === 'string') {
    // If skills is a JSON string, parse it
    try {
      const parsed = JSON.parse(modelProject.skills);
      skillsArray = Array.isArray(parsed) 
        ? parsed.map(s => typeof s === 'string' ? s : String(s))
        : [];
    } catch {
      // If parsing fails, treat as single skill
      skillsArray = [modelProject.skills];
    }
  }

  return {
    id: projectId,
    title: modelProject.title || '',
    description: modelProject.description || '',
    skills: skillsArray,
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



