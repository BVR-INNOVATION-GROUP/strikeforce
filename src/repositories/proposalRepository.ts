/**
 * Repository for milestone proposal data operations
 */
import { api } from "@/src/api/client";
import { MilestoneProposalI } from "@/src/models/milestone";

// Default to mock data in development mode
const isDevelopment = process.env.NODE_ENV === "development";
const USE_MOCK_DATA =
  isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// In-memory store for proposals (in production, this would be a database)
let proposalStore: MilestoneProposalI[] = [];

export const proposalRepository = {
  getAll: async (projectId?: string): Promise<MilestoneProposalI[]> => {
    if (USE_MOCK_DATA) {
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
    if (USE_MOCK_DATA) {
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
    if (USE_MOCK_DATA) {
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
    if (USE_MOCK_DATA) {
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
    if (USE_MOCK_DATA) {
      proposalStore = proposalStore.filter((p) => p.id !== id);
      return;
    }
    return api.delete(`/api/proposals/${id}`);
  },
};
