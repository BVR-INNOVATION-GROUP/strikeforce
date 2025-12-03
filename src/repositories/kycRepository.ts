/**
 * Repository for KYC document data operations
 * Connects to backend API
 * Note: Backend KYC module may need to be implemented
 */
import { api } from "@/src/api/client";
import { KycDocumentI } from "@/src/models/kyc";

export const kycRepository = {
  /**
   * Get all KYC documents
   * @param orgId - Optional filter by organization
   */
  getAll: async (orgId?: number | string): Promise<KycDocumentI[]> => {
    const url = orgId ? `/api/v1/kyc?orgId=${orgId}` : "/api/v1/kyc";
    return api.get<KycDocumentI[]>(url);
  },

  /**
   * Get KYC document by ID
   */
  getById: async (id: number): Promise<KycDocumentI> => {
    return api.get<KycDocumentI>(`/api/v1/kyc/${id}`);
  },

  /**
   * Create KYC document
   */
  create: async (document: Partial<KycDocumentI>): Promise<KycDocumentI> => {
    return api.post<KycDocumentI>("/api/v1/kyc", document);
  },

  /**
   * Update KYC document
   */
  update: async (
    id: number,
    document: Partial<KycDocumentI>
  ): Promise<KycDocumentI> => {
    return api.put<KycDocumentI>(`/api/v1/kyc/${id}`, document);
  },

  /**
   * Delete KYC document
   */
  delete: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/kyc/${id}`);
  },
};

