/**
 * Repository for organization data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { OrganizationI } from "@/src/models/organization";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const organizationRepository = {
  /**
   * Get organization by ID
   */
  getById: async (id: string | number): Promise<OrganizationI> => {
    if (getUseMockData()) {
      const organizations = await readJsonFile<OrganizationI>(
        "mockOrganizations.json"
      );
      const org = findById(organizations, id);
      if (!org) {
        throw new Error(`Organization ${id} not found`);
      }
      return org;
    }
    return api.get<OrganizationI>(`/api/organizations/${id}`);
  },

  /**
   * Get all organizations
   */
  getAll: async (): Promise<OrganizationI[]> => {
    if (getUseMockData()) {
      return await readJsonFile<OrganizationI>("mockOrganizations.json");
    }
    return api.get<OrganizationI[]>("/api/organizations");
  },

  /**
   * Update organization
   */
  update: async (
    id: string | number,
    data: Partial<OrganizationI>
  ): Promise<OrganizationI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<OrganizationI>(`/api/organizations/${id}`, data);
  },

  /**
   * Create organization
   */
  create: async (org: Partial<OrganizationI>): Promise<OrganizationI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<OrganizationI>("/api/organizations", org);
  },

  /**
   * Delete organization
   */
  delete: async (id: string | number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/organizations/${id}`);
  },
};
