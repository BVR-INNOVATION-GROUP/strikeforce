/**
 * Repository for milestone data operations
 */
import { api } from "@/src/api/client";
import { MilestoneI } from "@/src/models/milestone";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const milestoneRepository = {
  getAll: async (projectId?: string | number): Promise<MilestoneI[]> => {
    if (getUseMockData()) {
      const milestones = await readJsonFile<MilestoneI>("mockMilestones.json");
      if (projectId) {
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

  getById: async (id: string | number): Promise<MilestoneI> => {
    if (getUseMockData()) {
      const milestones = await readJsonFile<MilestoneI>("mockMilestones.json");
      const milestone = findById(milestones, id);
      if (!milestone) {
        throw new Error(`Milestone ${id} not found`);
      }
      return milestone;
    }
    return api.get<MilestoneI>(`/api/milestones/${id}`);
  },

  create: async (milestone: Partial<MilestoneI>): Promise<MilestoneI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<MilestoneI>("/api/milestones", milestone);
  },

  update: async (
    id: string | number,
    milestone: Partial<MilestoneI>
  ): Promise<MilestoneI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<MilestoneI>(`/api/milestones/${id}`, milestone);
  },

  /**
   * Delete milestone
   */
  delete: async (id: string | number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/milestones/${id}`);
  },
};
