/**
 * Repository for KYC document data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { KycDocumentI } from "@/src/models/kyc";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const kycRepository = {
  /**
   * Get all KYC documents
   * @param orgId - Optional filter by organization
   */
  getAll: async (orgId?: number | string): Promise<KycDocumentI[]> => {
    if (getUseMockData()) {
      try {
        let documents = await readJsonFile<KycDocumentI>("mockKycDocuments.json");
        if (orgId) {
          const numericOrgId = typeof orgId === 'string' ? parseInt(orgId, 10) : orgId;
          documents = documents.filter((d) => d.orgId === numericOrgId);
        }
        return documents;
      } catch {
        // Mock file doesn't exist yet, return empty array
        return [];
      }
    }
    const url = orgId ? `/api/kyc?orgId=${orgId}` : "/api/kyc";
    return api.get<KycDocumentI[]>(url);
  },

  /**
   * Get KYC document by ID
   */
  getById: async (id: number): Promise<KycDocumentI> => {
    if (getUseMockData()) {
      try {
        const documents = await readJsonFile<KycDocumentI>("mockKycDocuments.json");
        const document = findById(documents, id);
        if (!document) {
          throw new Error(`KYC document ${id} not found`);
        }
        return document;
      } catch {
        throw new Error(`KYC document ${id} not found`);
      }
    }
    return api.get<KycDocumentI>(`/api/kyc/${id}`);
  },

  /**
   * Create KYC document
   */
  create: async (document: Partial<KycDocumentI>): Promise<KycDocumentI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<KycDocumentI>("/api/kyc", document);
  },

  /**
   * Update KYC document
   */
  update: async (
    id: number,
    document: Partial<KycDocumentI>
  ): Promise<KycDocumentI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<KycDocumentI>(`/api/kyc/${id}`, document);
  },

  /**
   * Delete KYC document
   */
  delete: async (id: number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/kyc/${id}`);
  },
};

