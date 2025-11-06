/**
 * Repository for dispute data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { DisputeI } from "@/src/models/dispute";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

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
    if (getUseMockData()) {
      try {
        let disputes = await readJsonFile<DisputeI>("mockDisputes.json");
        if (filters?.level) {
          disputes = disputes.filter((d) => d.level === filters.level);
        }
        if (filters?.status) {
          disputes = disputes.filter((d) => d.status === filters.status);
        }
        if (filters?.raisedBy) {
          const numericRaisedBy = typeof filters.raisedBy === 'string' ? parseInt(filters.raisedBy, 10) : filters.raisedBy;
          disputes = disputes.filter((d) => d.raisedBy === numericRaisedBy);
        }
        return disputes;
      } catch {
        // Mock file doesn't exist yet, return empty array
        return [];
      }
    }
    const params = new URLSearchParams();
    if (filters?.level) params.append("level", filters.level);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.raisedBy) params.append("raisedBy", filters.raisedBy);
    const url = `/api/disputes?${params.toString()}`;
    return api.get<DisputeI[]>(url);
  },

  /**
   * Get dispute by ID
   */
  getById: async (id: number): Promise<DisputeI> => {
    if (getUseMockData()) {
      try {
        const disputes = await readJsonFile<DisputeI>("mockDisputes.json");
        const dispute = findById(disputes, id);
        if (!dispute) {
          throw new Error(`Dispute ${id} not found`);
        }
        return dispute;
      } catch {
        throw new Error(`Dispute ${id} not found`);
      }
    }
    return api.get<DisputeI>(`/api/disputes/${id}`);
  },

  /**
   * Create dispute
   */
  create: async (dispute: Partial<DisputeI>): Promise<DisputeI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<DisputeI>("/api/disputes", dispute);
  },

  /**
   * Update dispute
   */
  update: async (id: number, dispute: Partial<DisputeI>): Promise<DisputeI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<DisputeI>(`/api/disputes/${id}`, dispute);
  },

  /**
   * Delete dispute
   */
  delete: async (id: number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/disputes/${id}`);
  },
};

