/**
 * Application Service - business logic for student applications to projects
 * PRD Reference: Section 6 - Groups and Applications
 */
import { ApplicationI, ApplicationType } from "@/src/models/application";
import { applicationRepository } from "@/src/repositories/applicationRepository";

/**
 * Business logic layer for application operations
 */
export const applicationService = {
  /**
   * Submit a new application or update existing DECLINED/REJECTED application
   * @param applicationData - Application data to submit
   * @returns Created or updated application
   */
  submitApplication: async (
    applicationData: Partial<ApplicationI>
  ): Promise<ApplicationI> => {
    // Business validation
    if (!applicationData.projectId) {
      throw new Error("Project ID is required");
    }

    if (!applicationData.applicantType) {
      throw new Error("Applicant type is required");
    }

    // Strip HTML tags for validation (statement is now HTML from rich text editor)
    const stripHtml = (html: string): string => {
      if (typeof window !== "undefined") {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      }
      return html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
    };

    const plainTextStatement = stripHtml(applicationData.statement || "");
    if (!applicationData.statement || plainTextStatement.length < 50) {
      throw new Error("Application statement must be at least 50 characters");
    }

    if (
      !applicationData.studentIds ||
      applicationData.studentIds.length === 0
    ) {
      throw new Error("At least one student is required");
    }

    if (applicationData.applicantType === "GROUP" && !applicationData.groupId) {
      throw new Error("Group ID is required for group applications");
    }

    // Check if there's an existing DECLINED or REJECTED application for this project
    // If found, update it instead of creating a new one to avoid duplicates
    const numericProjectId =
      typeof applicationData.projectId === "string"
        ? parseInt(applicationData.projectId, 10)
        : (applicationData.projectId as number);

    try {
      // Get user's applications to find existing DECLINED/REJECTED for this project
      const userApplications = await applicationRepository.getByUserId();
      const existingApplication = userApplications.find((app) => {
        // Check if this is for the same project
        const appProjectId =
          typeof app.projectId === "string"
            ? parseInt(app.projectId, 10)
            : app.projectId;
        const projectMatches = appProjectId === numericProjectId;

        // Check if this application belongs to the same student(s)
        // Normalize IDs for comparison (handle both string and number types)
        const normalizeId = (id: string | number): number => {
          if (typeof id === "string") {
            const parsed = parseInt(id, 10);
            return isNaN(parsed) ? 0 : parsed;
          }
          return id;
        };

        const appStudentIds = app.studentIds.map(normalizeId).sort();
        const newStudentIds = (applicationData.studentIds || [])
          .map(normalizeId)
          .sort();

        // Check if student IDs match (same set of students)
        const studentIdsMatch =
          newStudentIds.length === appStudentIds.length &&
          newStudentIds.every((id, index) => appStudentIds[index] === id);

        const isDeclinedOrRejected =
          app.status === "DECLINED" || app.status === "REJECTED";

        console.log("Checking for existing application:", {
          projectMatches,
          studentIdsMatch,
          appStudentIds,
          newStudentIds,
          isDeclinedOrRejected,
          appStatus: app.status,
          appId: app.id,
        });

        return projectMatches && studentIdsMatch && isDeclinedOrRejected;
      });

      if (existingApplication && existingApplication.id) {
        console.log(
          "Found existing DECLINED/REJECTED application, updating instead of creating new one:",
          {
            applicationId: existingApplication.id,
            currentStatus: existingApplication.status,
            projectId: numericProjectId,
            studentIds: existingApplication.studentIds,
          }
        );
        // Update existing application - reactivate it with new data
        return applicationRepository.update(existingApplication.id, {
          applicantType: applicationData.applicantType as ApplicationType,
          studentIds: applicationData.studentIds,
          groupId: applicationData.groupId,
          statement: applicationData.statement.trim(),
          status: "SUBMITTED",
          attachments: applicationData.attachments,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn(
        "Failed to check for existing applications, proceeding with create:",
        error
      );
      // Continue with create if check fails
    }

    // No existing DECLINED/REJECTED application found, create new one
    console.log(
      "No existing DECLINED/REJECTED application found, creating new application"
    );
    return applicationRepository.create({
      projectId: numericProjectId,
      applicantType: applicationData.applicantType as ApplicationType,
      studentIds: applicationData.studentIds,
      groupId: applicationData.groupId,
      statement: applicationData.statement.trim(),
      status: "SUBMITTED",
      attachments: applicationData.attachments,
    });
  },

  /**
   * Check if user has already applied to a project
   * @param projectId - Project ID
   * @param studentId - Student ID
   * @returns True if already applied
   */
  hasApplied: async (
    projectId: string | number,
    studentId: string
  ): Promise<boolean> => {
    try {
      const numericProjectId =
        typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
      const applications = await applicationRepository.getAll(numericProjectId);
      return applications.some(
        (app) =>
          app.projectId === numericProjectId &&
          app.studentIds.includes(studentId)
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
  getProjectApplications: async (
    projectId: string | number
  ): Promise<ApplicationI[]> => {
    try {
      const numericProjectId =
        typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
      return applicationRepository.getAll(numericProjectId);
    } catch {
      return [];
    }
  },

  /**
   * Get authenticated user's applications
   * Backend uses JWT token's user_id - never pass userId parameter
   * @returns Array of user's applications
   */
  getUserApplications: async (): Promise<ApplicationI[]> => {
    try {
      return applicationRepository.getByUserId();
    } catch {
      return [];
    }
  },

  /**
   * Withdraw an application (student action)
   * @param applicationId - Application ID
   * @returns Updated application
   */
  withdrawApplication: async (applicationId: number): Promise<ApplicationI> => {
    console.log(
      "[applicationService.withdrawApplication] Starting withdrawal for applicationId:",
      applicationId
    );

    // Business validation - can only withdraw if status is SUBMITTED, SHORTLISTED, or WAITLIST
    console.log(
      "[applicationService.withdrawApplication] Fetching application to validate status..."
    );
    const application = await applicationRepository.getById(applicationId);
    console.log(
      "[applicationService.withdrawApplication] Application fetched:",
      application
    );

    if (application.status === "ASSIGNED") {
      throw new Error(
        "Cannot withdraw an assigned application. Use terminate contract instead."
      );
    }

    if (
      application.status === "REJECTED" ||
      application.status === "DECLINED"
    ) {
      throw new Error("Cannot withdraw a rejected or declined application.");
    }

    // Update status to DECLINED (student withdrew)
    console.log(
      "[applicationService.withdrawApplication] Updating application status to DECLINED..."
    );
    const result = await applicationRepository.update(applicationId, {
      status: "DECLINED",
      updatedAt: new Date().toISOString(),
    });
    console.log(
      "[applicationService.withdrawApplication] Application updated successfully:",
      result
    );
    return result;
  },

  /**
   * Terminate contract (student action for assigned applications)
   * @param applicationId - Application ID
   * @returns Updated application
   */
  terminateContract: async (applicationId: number): Promise<ApplicationI> => {
    // Business validation - can only terminate if status is ASSIGNED
    const application = await applicationRepository.getById(applicationId);

    if (application.status !== "ASSIGNED") {
      throw new Error("Can only terminate an assigned application.");
    }

    // Update status to DECLINED (student terminated)
    return applicationRepository.update(applicationId, {
      status: "DECLINED",
      updatedAt: new Date().toISOString(),
    });
  },
};
