/**
 * Repository for dispute data operations
 * Connects to backend API
 * Note: Backend Dispute module exists but may need additional endpoints
 */
import { api } from "@/src/api/client";
import { DisputeI } from "@/src/models/dispute";

export const disputeRepository = {
  /**
   * Get all disputes
   * @param filters - Optional filters (level, status, raisedBy)
   */
  getAll: async (filters?: {
    level?: string;
    status?: string;
    raisedBy?: number | string;
  }): Promise<DisputeI[]> => {
    const params = new URLSearchParams();
    if (filters?.level) params.append("level", filters.level);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.raisedBy) params.append("raisedBy", filters.raisedBy.toString());
    const url = params.toString() ? `/api/v1/disputes?${params.toString()}` : "/api/v1/disputes";
    return api.get<DisputeI[]>(url);
  },

  /**
   * Get dispute by ID
   */
  getById: async (id: number): Promise<DisputeI> => {
    return api.get<DisputeI>(`/api/v1/disputes/${id}`);
  },

  /**
   * Create dispute
   */
  create: async (dispute: Partial<DisputeI>): Promise<DisputeI> => {
    return api.post<DisputeI>("/api/v1/disputes", dispute);
  },

  /**
   * Update dispute
   */
  update: async (id: number, dispute: Partial<DisputeI>): Promise<DisputeI> => {
    return api.put<DisputeI>(`/api/v1/disputes/${id}`, dispute);
  },

  /**
   * Delete dispute
   */
  delete: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/disputes/${id}`);
  },
};

