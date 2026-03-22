/**
 * Repository for delegated access operations
 */
import { api } from "@/src/api/client";
import {
  DelegatedAccessI,
  CreateDelegatedAccessRequest,
} from "@/src/models/delegatedAccess";

export const delegatedAccessRepository = {
  /**
   * Get delegated users for the current admin's org (uni/partner) or for super-admin when organizationId is set.
   */
  getAll: async (organizationId?: number): Promise<DelegatedAccessI[]> => {
    const q =
      organizationId != null && organizationId > 0
        ? `?organizationId=${organizationId}`
        : "";
    return api.get<DelegatedAccessI[]>(`/api/v1/delegated-access${q}`);
  },

  /**
   * Create a new delegated user (super-admin must pass organizationId)
   */
  create: async (
    request: CreateDelegatedAccessRequest
  ): Promise<DelegatedAccessI> => {
    return api.post<DelegatedAccessI>("/api/v1/delegated-access", request);
  },

  /**
   * Withdraw delegated access (delete)
   */
  delete: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/delegated-access/${id}`);
  },
};






