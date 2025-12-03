/**
 * Repository for milestone proposal data operations
 * Connects to backend API
 * Note: Backend Proposal module may need to be implemented
 */
import { api } from "@/src/api/client";
import { MilestoneProposalI } from "@/src/models/milestone";

export const proposalRepository = {
  getAll: async (projectId?: string): Promise<MilestoneProposalI[]> => {
    const url = projectId
      ? `/api/v1/proposals?projectId=${projectId}`
      : "/api/v1/proposals";
    return api.get<MilestoneProposalI[]>(url);
  },

  getById: async (id: string): Promise<MilestoneProposalI> => {
    return api.get<MilestoneProposalI>(`/api/v1/proposals/${id}`);
  },

  create: async (
    proposal: Partial<MilestoneProposalI>
  ): Promise<MilestoneProposalI> => {
    return api.post<MilestoneProposalI>("/api/v1/proposals", proposal);
  },

  update: async (
    id: string,
    proposal: Partial<MilestoneProposalI>
  ): Promise<MilestoneProposalI> => {
    return api.put<MilestoneProposalI>(`/api/v1/proposals/${id}`, proposal);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/api/v1/proposals/${id}`);
  },
};
