/**
 * Repository for application data operations
 * Connects to backend API
 * Note: Backend Application module may need to be implemented
 */
import { api } from "@/src/api/client";
import { ApplicationI } from "@/src/models/application";

export const applicationRepository = {
  /**
   * Transform backend application format (ID) to frontend format (id)
   */
  transformApplication: (app: any): ApplicationI => {
    return {
      ...app,
      id: app.id || app.ID || app.applicationId || app._id,
      projectId: app.projectId || app.projectID,
      groupId: app.groupId || app.groupID,
      studentIds: app.studentIds || app.studentIDs || [],
      createdAt: app.createdAt || app.CreatedAt,
      updatedAt: app.updatedAt || app.UpdatedAt,
    } as ApplicationI;
  },

  /**
   * Get all applications
   * @param projectId - Optional filter by project
   */
  getAll: async (projectId?: number): Promise<ApplicationI[]> => {
    const url = projectId
      ? `/api/v1/applications?projectId=${projectId}`
      : "/api/v1/applications";
    const applications = await api.get<any[]>(url);
    // Transform backend format (ID) to frontend format (id)
    return applications.map((app) =>
      applicationRepository.transformApplication(app)
    );
  },

  /**
   * Get application by ID
   */
  getById: async (id: number): Promise<ApplicationI> => {
    console.log(
      "[applicationRepository.getById] Fetching application with ID:",
      id
    );
    const url = `/api/v1/applications/${id}`;
    console.log("[applicationRepository.getById] URL:", url);
    const result = await api.get<any>(url);
    console.log("[applicationRepository.getById] Result:", result);
    // Transform backend format (ID) to frontend format (id)
    return applicationRepository.transformApplication(result);
  },

  /**
   * Get applications for the authenticated user
   * Backend uses JWT token's user_id - never pass userId parameter
   */
  getByUserId: async (): Promise<ApplicationI[]> => {
    const applications = await api.get<any[]>("/api/v1/applications");
    // Transform backend format (ID) to frontend format (id)
    return applications.map((app) =>
      applicationRepository.transformApplication(app)
    );
  },

  /**
   * Get applications for a project
   */
  getProjectApplications: async (
    projectId: number
  ): Promise<ApplicationI[]> => {
    const applications = await api.get<any[]>(
      `/api/v1/applications?projectId=${projectId}`
    );
    // Transform backend format (ID) to frontend format (id)
    return applications.map((app) =>
      applicationRepository.transformApplication(app)
    );
  },

  /**
   * Create new application
   * Maps frontend format to backend format
   * Note: Backend handles studentIds automatically based on applicantType:
   * - INDIVIDUAL: Sets studentIds to [currentUser]
   * - GROUP: Extracts studentIds from group members
   */
  create: async (application: Partial<ApplicationI>): Promise<ApplicationI> => {
    // Ensure projectId is a number (backend expects uint)
    const projectId =
      typeof application.projectId === "string"
        ? parseInt(application.projectId, 10)
        : application.projectId || 0;

    if (!projectId || isNaN(projectId)) {
      throw new Error("Project ID must be a valid number");
    }

    // Backend expects camelCase JSON fields that match the Application struct
    const backendData: any = {
      projectId: projectId, // Ensure it's a number, not a string
      applicantType: application.applicantType || "INDIVIDUAL",
      statement: application.statement || "",
      status: application.status || "SUBMITTED",
    };

    // Only include groupId for GROUP applications (ensure it's a number)
    if (application.applicantType === "GROUP" && application.groupId) {
      const groupId =
        typeof application.groupId === "string"
          ? parseInt(application.groupId, 10)
          : application.groupId;
      if (groupId && !isNaN(groupId)) {
        backendData.groupId = groupId;
      }
    }

    // Include attachments if provided
    if (application.attachments && application.attachments.length > 0) {
      backendData.attachments = application.attachments;
    }

    // API client's extractData will handle { data: ApplicationI, msg: string } response format
    const result = await api.post<any>("/api/v1/applications", backendData);
    // Transform backend format (ID) to frontend format (id)
    return applicationRepository.transformApplication(result);
  },

  /**
   * Update application
   */
  update: async (
    id: number,
    application: Partial<ApplicationI>
  ): Promise<ApplicationI> => {
    console.log(
      "[applicationRepository.update] Updating application with ID:",
      id,
      "Data:",
      application
    );
    const url = `/api/v1/applications/${id}`;
    console.log("[applicationRepository.update] URL:", url);
    const result = await api.put<any>(url, application);
    console.log("[applicationRepository.update] Result:", result);
    // Transform backend format (ID) to frontend format (id)
    return applicationRepository.transformApplication(result);
  },

  /**
   * Delete application
   */
  delete: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/applications/${id}`);
  },

  /**
   * Accept an offer (student action)
   * Changes status from OFFERED to ASSIGNED
   */
  acceptOffer: async (id: number): Promise<ApplicationI> => {
    const result = await api.post<any>(
      `/api/v1/applications/${id}/accept-offer`,
      {}
    );
    return applicationRepository.transformApplication(result);
  },

  /**
   * Decline an offer (student action)
   * Changes status from OFFERED to DECLINED
   */
  declineOffer: async (id: number): Promise<ApplicationI> => {
    const result = await api.post<any>(
      `/api/v1/applications/${id}/decline-offer`,
      {}
    );
    return applicationRepository.transformApplication(result);
  },

  /**
   * Shortlist an application (university admin/partner action)
   * Changes status to SHORTLISTED
   */
  shortlist: async (id: number): Promise<ApplicationI> => {
    const result = await api.post<any>(
      `/api/v1/applications/${id}/shortlist`,
      {}
    );
    return applicationRepository.transformApplication(result);
  },

  /**
   * Reject an application (university admin/partner action)
   * Changes status to REJECTED
   */
  reject: async (id: number): Promise<ApplicationI> => {
    const result = await api.post<any>(`/api/v1/applications/${id}/reject`, {});
    return applicationRepository.transformApplication(result);
  },

  /**
   * Undo reject - restore application to previous status (SUBMITTED or SHORTLISTED)
   */
  undoReject: async (
    id: number,
    previousStatus: string = "SUBMITTED"
  ): Promise<ApplicationI> => {
    // Use update to restore the previous status
    const result = await api.put<any>(`/api/v1/applications/${id}`, {
      status: previousStatus,
    });
    return applicationRepository.transformApplication(result);
  },

  /**
   * Issue an offer to a shortlisted application (university admin action)
   * Changes status to ASSIGNED immediately (no offer/accept flow)
   */
  offer: async (id: number): Promise<ApplicationI> => {
    const result = await api.post<any>(`/api/v1/applications/${id}/offer`, {});
    return applicationRepository.transformApplication(result);
  },

  /**
   * Score an application (university admin/partner action)
   * Updates the application score
   */
  score: async (
    id: number,
    score: {
      applicationId: number;
      autoScore?: number;
      manualSupervisorScore?: number;
      finalScore: number;
      skillMatch?: number;
      portfolioScore?: number;
      ratingScore?: number;
      onTimeRate?: number;
      reworkRate?: number;
    }
  ): Promise<ApplicationI> => {
    const result = await api.post<any>(`/api/v1/applications/${id}/score`, {
      score,
    });
    return applicationRepository.transformApplication(result);
  },
};
