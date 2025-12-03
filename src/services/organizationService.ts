/**
 * Service layer for organization business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { OrganizationI } from "@/src/models/organization";

export const organizationService = {
  /**
   * Get all organizations
   */
  getAllOrganizations: async (): Promise<OrganizationI[]> => {
    return organizationRepository.getAll();
  },

  /**
   * Create a new organization
   * PRD Reference: Section 4 - Organizations sign up
   */
  createOrganization: async (orgData: Partial<OrganizationI>): Promise<OrganizationI> => {
    return organizationRepository.create(orgData);
  },

  /**
   * Get organization by ID
   */
  getOrganization: async (id: string): Promise<OrganizationI> => {
    return organizationRepository.getById(id);
  },

  /**
   * Get organization information for display
   */
  getOrganizationInfo: async (id: string): Promise<{
    name: string;
    type: string;
    kycStatus: string;
  }> => {
    const org = await organizationRepository.getById(id);
    return {
      name: org.name,
      type: org.type,
      kycStatus: org.kycStatus,
    };
  },

  /**
   * Get nested organizations with departments and courses
   * Optimized for populating select forms
   * @param type - Optional filter by organization type (e.g., "university")
   */
  getNestedOrganizations: async (type?: string): Promise<{
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
    return organizationRepository.getNested(type);
  },

  /**
   * Update organization
   */
  updateOrganization: async (
    id: string,
    updates: Partial<OrganizationI>
  ): Promise<OrganizationI> => {
    return organizationRepository.update(id, updates);
  },
};





