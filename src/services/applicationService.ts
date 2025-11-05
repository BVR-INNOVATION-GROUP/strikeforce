/**
 * Application Service - business logic for student applications to projects
 * PRD Reference: Section 6 - Groups and Applications
 */
import { ApplicationI, ApplicationType } from '@/src/models/application';
import { ProjectI } from '@/src/models/project';

/**
 * Business logic layer for application operations
 */
export const applicationService = {
  /**
   * Submit a new application
   * @param applicationData - Application data to submit
   * @returns Created application
   */
  submitApplication: async (applicationData: Partial<ApplicationI>): Promise<ApplicationI> => {
    // Business validation
    if (!applicationData.projectId) {
      throw new Error("Project ID is required");
    }

    if (!applicationData.applicantType) {
      throw new Error("Applicant type is required");
    }

    if (!applicationData.statement || applicationData.statement.trim().length < 50) {
      throw new Error("Application statement must be at least 50 characters");
    }

    if (!applicationData.studentIds || applicationData.studentIds.length === 0) {
      throw new Error("At least one student is required");
    }

    if (applicationData.applicantType === "GROUP" && !applicationData.groupId) {
      throw new Error("Group ID is required for group applications");
    }

    // Create application
    const newApplication: ApplicationI = {
      id: `app-${Date.now()}`,
      projectId: applicationData.projectId,
      applicantType: applicationData.applicantType as ApplicationType,
      studentIds: applicationData.studentIds,
      groupId: applicationData.groupId,
      statement: applicationData.statement.trim(),
      status: "SUBMITTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In production, save to repository/API
    // For now, return the created application
    return newApplication;
  },

  /**
   * Check if user has already applied to a project
   * @param projectId - Project ID
   * @param studentId - Student ID
   * @returns True if already applied
   */
  hasApplied: async (projectId: string, studentId: string): Promise<boolean> => {
    try {
      const applicationsData = await import('@/src/data/mockApplications.json');
      const applications = applicationsData.default as ApplicationI[];
      
      return applications.some(
        (app) => app.projectId === projectId && app.studentIds.includes(studentId)
      );
    } catch {
      return false;
    }
  },

  /**
   * Get applications for a project
   * @param projectId - Project ID
   * @returns Array of applications
   */
  getProjectApplications: async (projectId: string): Promise<ApplicationI[]> => {
    try {
      const applicationsData = await import('@/src/data/mockApplications.json');
      const applications = applicationsData.default as ApplicationI[];
      
      return applications.filter((app) => app.projectId === projectId);
    } catch {
      return [];
    }
  },

  /**
   * Get user's applications
   * @param studentId - Student ID
   * @returns Array of user's applications
   */
  getUserApplications: async (studentId: string): Promise<ApplicationI[]> => {
    try {
      const applicationsData = await import('@/src/data/mockApplications.json');
      const applications = applicationsData.default as ApplicationI[];
      
      return applications.filter((app) => app.studentIds.includes(studentId));
    } catch {
      return [];
    }
  },
};





