/**
 * Repository for organization data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { OrganizationI } from "@/src/models/organization";

// Environment configuration
// Default to mock data in development mode
// Can be disabled by setting NEXT_PUBLIC_USE_MOCK=false
const isDevelopment = process.env.NODE_ENV === "development";
const USE_MOCK_DATA =
  isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const organizationRepository = {
  /**
   * Get organization by ID
   */
  getById: async (id: string): Promise<OrganizationI> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockOrganizations.json");
      const organizations = mockData.default as OrganizationI[];
      const org = organizations.find((o) => o.id === id);
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
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockOrganizations.json");
      return mockData.default as OrganizationI[];
    }
    return api.get<OrganizationI[]>("/api/organizations");
  },

  /**
   * Update organization
   */
  update: async (
    id: string,
    data: Partial<OrganizationI>
  ): Promise<OrganizationI> => {
    if (USE_MOCK_DATA) {
      const existing = await organizationRepository.getById(id);
      return { ...existing, ...data, updatedAt: new Date().toISOString() };
    }
    return api.put<OrganizationI>(`/api/organizations/${id}`, data);
  },
};
