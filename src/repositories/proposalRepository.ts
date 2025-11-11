/**
 * Repository for milestone proposal data operations
 */
import { api } from "@/src/api/client";
import { MilestoneProposalI } from "@/src/models/milestone";
import { getUseMockData } from "@/src/utils/config";

// In-memory store for proposals (in production, this would be a database)
let proposalStore: MilestoneProposalI[] = [];

export const proposalRepository = {
  getAll: async (projectId?: string): Promise<MilestoneProposalI[]> => {
    if (getUseMockData()) {
      const filtered = projectId
        ? proposalStore.filter((p) => p.projectId === projectId)
        : proposalStore;
      return filtered;
    }
    const url = projectId
      ? `/api/proposals?projectId=${projectId}`
      : "/api/proposals";
    return api.get<MilestoneProposalI[]>(url);
  },

  getById: async (id: string): Promise<MilestoneProposalI> => {
    if (getUseMockData()) {
      const proposal = proposalStore.find((p) => p.id === id);
      if (!proposal) {
        throw new Error(`Proposal ${id} not found`);
      }
      return proposal;
    }
    return api.get<MilestoneProposalI>(`/api/proposals/${id}`);
  },

  create: async (
    proposal: Partial<MilestoneProposalI>
  ): Promise<MilestoneProposalI> => {
    if (getUseMockData()) {
      const newProposal = {
        id: `proposal-${Date.now()}`,
        ...proposal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as MilestoneProposalI;
      proposalStore.push(newProposal);
      return newProposal;
    }
    return api.post<MilestoneProposalI>("/api/proposals", proposal);
  },

  update: async (
    id: string,
    proposal: Partial<MilestoneProposalI>
  ): Promise<MilestoneProposalI> => {
    if (getUseMockData()) {
      const index = proposalStore.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error(`Proposal ${id} not found`);
      }
      const updated = {
        ...proposalStore[index],
        ...proposal,
        updatedAt: new Date().toISOString(),
      } as MilestoneProposalI;
      proposalStore[index] = updated;
      return updated;
    }
    return api.put<MilestoneProposalI>(`/api/proposals/${id}`, proposal);
  },

  delete: async (id: string): Promise<void> => {
    if (getUseMockData()) {
      proposalStore = proposalStore.filter((p) => p.id !== id);
      return;
    }
    return api.delete(`/api/proposals/${id}`);
  },
};
