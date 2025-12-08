/**
 * Project display data transformation utilities
 */
import { ProjectI } from "@/src/models/project";
import { ApplicationI } from "@/src/models/application";
import { MilestoneI } from "@/src/models/milestone";
import {
  transformApplications,
  transformMilestones,
  transformTeamMembers,
} from "./projectTransformers";
import { formatDateShort } from "./dateFormatters";
import { getMockProjectDisplayData } from "./mockProjectData";

export interface ProjectDisplayI {
  id: number;
  title: string;
  description: string; // Kept for backward compatibility
  summary?: string;
  challengeStatement?: string;
  scopeActivities?: string;
  deliverablesMilestones?: string;
  teamStructure?: "individuals" | "groups" | "both";
  duration?: string;
  expectations?: string;
  skills: string[];
  status: string;
  budget: number;
  currency: string;
  deadline: string;
  capacity: number;
  university: string;
  department: string;
  course: string;
  createdAt: string;
  attachments?: string[];
  applications: Array<{
    id: number;
    groupName: string;
    members: Array<{ name: string; avatar: string }>;
    status: string;
    portfolioScore: number;
    appliedAt: string;
  }>;
  milestones: Array<{
    id: number;
    title: string;
    status: string;
    dueDate: string;
    amount: number;
    currency?: string;
    progress?: number;
    completedDate?: string;
  }>;
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    badges: {
      isLeader: boolean;
      isSupervisor: boolean;
      isYou: boolean;
    };
  }>;
}

/**
 * Transforms project data to display format
 * @param sourceProject - Source project data or null
 * @param applications - Array of application objects
 * @param milestones - Array of milestone objects
 * @param projectId - Project ID for mock data fallback
 * @param groups - Optional groups data for application transformation
 * @param users - Optional users data for application transformation
 * @param supervisorId - Optional supervisor ID for badge display
 * @param currentUserId - Optional current user ID for badge display
 * @returns Transformed project display data
 */
export const transformProjectForDisplay = async (
  sourceProject: ProjectI | null,
  applications: ApplicationI[],
  milestones: MilestoneI[],
  projectId: string,
  groups?: unknown[],
  users?: unknown[],
  supervisorId?: string,
  currentUserId?: string
): Promise<ProjectDisplayI> => {
  if (sourceProject) {
    const formattedDeadline = formatDateShort(sourceProject.deadline);

    // Load groups and users if not provided
    let groupsData = groups;
    let usersData = users;

    if (!groupsData || !usersData) {
      const [groupRepo, userRepo] = await Promise.all([
        import("@/src/repositories/groupRepository"),
        import("@/src/repositories/userRepository"),
      ]);
      const [groupsList, usersList] = await Promise.all([
        groupRepo.groupRepository.getAll(),
        userRepo.userRepository.getAll(),
      ]);
      groupsData = groupsData || groupsList;
      usersData = usersData || usersList;
    }

    const mappedApplications = transformApplications(
      applications,
      groupsData,
      usersData
    );
    const mappedMilestones = transformMilestones(
      milestones,
      sourceProject.currency
    );
    const teamMembers = transformTeamMembers(
      applications,
      usersData,
      groupsData,
      supervisorId || sourceProject.supervisorId,
      currentUserId
    );

    // Handle budget - extract from Budget object if needed
    let budgetValue: number = 0;
    let currencyValue: string = "";

    if (
      sourceProject.budget &&
      typeof sourceProject.budget === "object" &&
      !Array.isArray(sourceProject.budget)
    ) {
      const budgetObj = sourceProject.budget as any;
      budgetValue =
        budgetObj.Value !== undefined
          ? budgetObj.Value
          : budgetObj.value !== undefined
          ? budgetObj.value
          : 0;
      currencyValue = budgetObj.Currency || budgetObj.currency || "";
    } else if (typeof sourceProject.budget === "number") {
      budgetValue = sourceProject.budget;
      currencyValue = sourceProject.currency || "";
    } else {
      budgetValue =
        typeof sourceProject.budget === "string"
          ? parseFloat(sourceProject.budget) || 0
          : 0;
      currencyValue = sourceProject.currency || "";
    }

    // Extract university, department, and course from project data
    // Check if nested structure exists (raw data from backend)
    const rawProject = sourceProject as any;
    let universityName = "";
    let departmentName = "";
    let courseName = "";

    if (rawProject.department) {
      // Extract department name
      departmentName =
        rawProject.department.name || rawProject.department.Name || "";

      // Extract university name from nested organization
      if (rawProject.department.organization) {
        universityName =
          rawProject.department.organization.name ||
          rawProject.department.organization.Name ||
          "";
      } else if (rawProject.department.Organization) {
        universityName =
          rawProject.department.Organization.name ||
          rawProject.department.Organization.Name ||
          "";
      }
    }

    // Extract course name from nested course object
    if (rawProject.course) {
      courseName = rawProject.course.name || rawProject.course.Name || "";
    } else if (rawProject.Course) {
      courseName = rawProject.Course.name || rawProject.Course.Name || "";
    }

    return {
      id: sourceProject.id,
      title: sourceProject.title,
      description: sourceProject.description,
      summary: sourceProject.summary,
      challengeStatement: sourceProject.challengeStatement,
      scopeActivities: sourceProject.scopeActivities,
      deliverablesMilestones: sourceProject.deliverablesMilestones,
      teamStructure: sourceProject.teamStructure,
      duration: sourceProject.duration,
      expectations: sourceProject.expectations,
      skills: sourceProject.skills,
      status: sourceProject.status,
      budget: budgetValue,
      currency: currencyValue,
      deadline: formattedDeadline,
      capacity: sourceProject.capacity,
      university: universityName || "Not specified",
      department: departmentName || "Not specified",
      course: courseName || "Not specified",
      createdAt: sourceProject.createdAt,
      attachments: sourceProject.attachments,
      applications: mappedApplications,
      milestones: mappedMilestones,
      teamMembers,
    };
  }

  return getMockProjectDisplayData(projectId);
};
