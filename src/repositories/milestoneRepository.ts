/**
 * Repository for milestone data operations
 */
import { api } from "@/src/api/client";
import { MilestoneI, MilestoneProposalI } from "@/src/models/milestone";

// Default to mock data in development mode
// Can be disabled by setting NEXT_PUBLIC_USE_MOCK=false
const isDevelopment = process.env.NODE_ENV === "development";
const USE_MOCK_DATA =
  isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const milestoneRepository = {
  getAll: async (projectId?: string): Promise<MilestoneI[]> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockMilestones.json");
      const milestones = mockData.default as MilestoneI[];
      if (projectId) {
        // Convert projectId to number for comparison (URL params come as strings, but mock data uses numbers)
        const numericProjectId =
          typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
        return milestones.filter((m) => m.projectId === numericProjectId);
      }
      return milestones;
    }
    const url = projectId
      ? `/api/milestones?projectId=${projectId}`
      : "/api/milestones";
    return api.get<MilestoneI[]>(url);
  },

  getById: async (id: string): Promise<MilestoneI> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockMilestones.json");
      const milestones = mockData.default as MilestoneI[];
      // Convert id to number for comparison (URL params come as strings, but mock data uses numbers)
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const milestone = milestones.find((m) => m.id === numericId);
      if (!milestone) {
        throw new Error(`Milestone ${id} not found`);
      }
      return milestone;
    }
    return api.get<MilestoneI>(`/api/milestones/${id}`);
  },

  create: async (milestone: Partial<MilestoneI>): Promise<MilestoneI> => {
    if (USE_MOCK_DATA) {
      return {
        id: `milestone-${Date.now()}`,
        ...milestone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as MilestoneI;
    }
    return api.post<MilestoneI>("/api/milestones", milestone);
  },

  update: async (
    id: string,
    milestone: Partial<MilestoneI>
  ): Promise<MilestoneI> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockMilestones.json");
      const milestones = mockData.default as MilestoneI[];
      // Convert id to number for comparison (URL params come as strings, but mock data uses numbers)
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const existing = milestones.find((m) => m.id === numericId);
      if (!existing) {
        throw new Error(`Milestone ${id} not found`);
      }
      return {
        ...existing,
        ...milestone,
        updatedAt: new Date().toISOString(),
      } as MilestoneI;
    }
    return api.put<MilestoneI>(`/api/milestones/${id}`, milestone);
  },
};
