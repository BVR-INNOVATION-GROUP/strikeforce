/**
 * Repository for milestone data operations
 * Connects to backend API
 */
import { api } from "@/src/api/client";
import { MilestoneI } from "@/src/models/milestone";

/**
 * Normalize a milestone from backend format to frontend format
 * Backend uses GORM which returns uppercase field names (ID, CreatedAt, etc.)
 * Frontend expects lowercase (id, createdAt, etc.)
 */
function normalizeMilestone(milestone: any): MilestoneI {
  if (!milestone) {
    throw new Error("Cannot normalize null or undefined milestone");
  }
  
  return {
    ...milestone,
    // Map uppercase ID to lowercase id (GORM returns ID, frontend expects id)
    id: milestone.ID !== undefined ? milestone.ID : (milestone.id !== undefined ? milestone.id : milestone.Id),
    // Map other GORM fields if needed
    projectId: milestone.projectId !== undefined ? milestone.projectId : milestone.project_id,
    createdAt: milestone.CreatedAt || milestone.createdAt,
    updatedAt: milestone.UpdatedAt || milestone.updatedAt,
  };
}

export const milestoneRepository = {
  /**
   * Get all milestones
   * @param projectId - Optional filter by project
   * Note: Backend may need to add this endpoint if not available
   */
  getAll: async (projectId?: string | number): Promise<MilestoneI[]> => {
    const url = projectId
      ? `/api/v1/milestones?projectId=${projectId}`
      : "/api/v1/milestones";
    const response = await api.get<any>(url);
    
    // Handle response format: could be {data: [...]} or direct array
    const milestones = response.data || response;
    const milestonesArray = Array.isArray(milestones) ? milestones : (milestones?.data || []);
    
    return milestonesArray.map(normalizeMilestone);
  },

  /**
   * Get milestone by ID
   * Note: Backend may need to add this endpoint if not available
   */
  getById: async (id: string | number): Promise<MilestoneI> => {
    const response = await api.get<any>(`/api/v1/milestones/${id}`);
    return normalizeMilestone(response.data || response);
  },

  /**
   * Create new milestone
   * Backend endpoint: POST /api/v1/milestones
   */
  create: async (milestone: Partial<MilestoneI>): Promise<MilestoneI> => {
    const response = await api.post<any>("/api/v1/milestones", milestone);
    // Backend returns {msg, data} format
    return normalizeMilestone(response.data || response);
  },

  /**
   * Update milestone status
   * Backend endpoint: PUT /api/v1/milestones/update-status
   */
  updateStatus: async (id: string | number, status: string): Promise<MilestoneI> => {
    const response = await api.put<any>(`/api/v1/milestones/update-status`, { id, status });
    return normalizeMilestone(response.data || response);
  },

  /**
   * Update milestone
   * Backend endpoint: PUT /api/v1/milestones/:id
   */
  update: async (
    id: string | number,
    milestone: Partial<MilestoneI>
  ): Promise<MilestoneI> => {
    console.log("[milestoneRepository] update called:", { id, milestone });
    const url = `/api/v1/milestones/${id}`;
    console.log("[milestoneRepository] Making PUT request to:", url);
    const response = await api.put<any>(url, milestone);
    console.log("[milestoneRepository] Update response received:", response);
    // Backend returns {msg, data} format
    return normalizeMilestone(response.data || response);
  },

  /**
   * Delete milestone
   * Backend endpoint: DELETE /api/v1/milestones/:id
   */
  delete: async (id: string | number): Promise<void> => {
    await api.delete(`/api/v1/milestones/${id}`);
  },
};
