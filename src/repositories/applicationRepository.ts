/**
 * Repository for application data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { ApplicationI } from "@/src/models/application";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const applicationRepository = {
  /**
   * Get all applications
   * @param projectId - Optional filter by project
   */
  getAll: async (projectId?: number): Promise<ApplicationI[]> => {
    if (getUseMockData()) {
      const applications = await readJsonFile<ApplicationI>("mockApplications.json");
      if (projectId) {
        return applications.filter((a) => a.projectId === projectId);
      }
      return applications;
    }
    const url = projectId
      ? `/api/applications?projectId=${projectId}`
      : "/api/applications";
    return api.get<ApplicationI[]>(url);
  },

  /**
   * Get application by ID
   */
  getById: async (id: number): Promise<ApplicationI> => {
    if (getUseMockData()) {
      const applications = await readJsonFile<ApplicationI>("mockApplications.json");
      const application = findById(applications, id);
      if (!application) {
        throw new Error(`Application ${id} not found`);
      }
      return application;
    }
    return api.get<ApplicationI>(`/api/applications/${id}`);
  },

  /**
   * Get applications by user ID
   */
  getByUserId: async (userId: number | string): Promise<ApplicationI[]> => {
    if (getUseMockData()) {
      const applications = await readJsonFile<ApplicationI>("mockApplications.json");
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      return applications.filter((a) => a.studentIds.includes(numericUserId));
    }
    return api.get<ApplicationI[]>(`/api/applications?userId=${userId}`);
  },

  /**
   * Create new application
   */
  create: async (application: Partial<ApplicationI>): Promise<ApplicationI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<ApplicationI>("/api/applications", application);
  },

  /**
   * Update application
   */
  update: async (
    id: number,
    application: Partial<ApplicationI>
  ): Promise<ApplicationI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<ApplicationI>(`/api/applications/${id}`, application);
  },

  /**
   * Delete application
   */
  delete: async (id: number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/applications/${id}`);
  },
};

