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
   * Get all delegated users for the current university admin
   */
  getAll: async (): Promise<DelegatedAccessI[]> => {
    return api.get<DelegatedAccessI[]>("/api/v1/delegated-access");
  },

  /**
   * Create a new delegated user
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
