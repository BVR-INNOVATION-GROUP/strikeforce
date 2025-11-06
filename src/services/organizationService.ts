/**
 * Service layer for organization business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { OrganizationI } from "@/src/models/organization";

export const organizationService = {
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
};





