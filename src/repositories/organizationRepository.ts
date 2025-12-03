/**
 * Repository for organization data operations
 * Connects to backend API
 */
import { api } from "@/src/api/client";
import { OrganizationI, OrganizationDashboardStats } from "@/src/models/organization";

export const organizationRepository = {
  /**
   * Get organizations by type
   * Backend endpoint: GET /api/v1/org?type=university|company
   */
  getByType: async (type: string): Promise<OrganizationI[]> => {
    return api.get<OrganizationI[]>(`/api/v1/org?type=${type}`);
  },

  /**
   * Get all organizations
   * Backend endpoint: GET /api/v1/org
   */
  getAll: async (): Promise<OrganizationI[]> => {
    return api.get<OrganizationI[]>("/api/v1/org");
  },

  /**
   * Get organization by ID
   * Note: Backend may need to add this endpoint if not available
   */
  getById: async (id: string | number): Promise<OrganizationI> => {
    return api.get<OrganizationI>(`/api/v1/org/${id}`);
  },

  /**
   * Create organization
   * Backend endpoint: POST /api/v1/org
   */
  create: async (org: Partial<OrganizationI>): Promise<OrganizationI> => {
    return api.post<OrganizationI>("/api/v1/org", org);
  },

  /**
   * Update organization
   * Note: Backend may need to add this endpoint if not available
   */
  update: async (
    id: string | number,
    data: Partial<OrganizationI>
  ): Promise<OrganizationI> => {
    return api.put<OrganizationI>(`/api/v1/org/${id}`, data);
  },

  /**
   * Delete organization
   * Note: Backend may need to add this endpoint if not available
   */
  delete: async (id: string | number): Promise<void> => {
    return api.delete(`/api/v1/org/${id}`);
  },

  /**
   * Get aggregated dashboard stats for an organization
   * Backend endpoint: GET /api/v1/org/:id/dashboard
   */
  getDashboardStats: async (id: string | number): Promise<OrganizationDashboardStats> => {
    return api.get<OrganizationDashboardStats>(`/api/v1/org/${id}/dashboard`);
  },

  /**
   * Get nested organizations with departments and courses
   * Backend endpoint: GET /api/v1/org/nested?type=university (optional)
   */
  getNested: async (type?: string): Promise<{
    id: number;
    name: string;
    type: string;
    departments: {
      id: number;
      name: string;
      courses: {
        id: number;
        name: string;
      }[];
    }[];
  }[]> => {
    const url = type 
      ? `/api/v1/org/nested?type=${type}` 
      : "/api/v1/org/nested";
    return api.get(url);
  },

  /**
   * Get partner dashboard statistics
   * Backend endpoint: GET /api/v1/org/partner/dashboard
   */
  getPartnerDashboardStats: async (): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
  }> => {
    return api.get("/api/v1/org/partner/dashboard");
  },
};
