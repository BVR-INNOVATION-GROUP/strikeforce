import { api } from "@/src/api/client";

export interface BranchI {
  id: number;
  name: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Normalize a branch from backend format to frontend format
 * Backend uses GORM which returns uppercase field names (ID, CreatedAt, etc.)
 * Frontend expects lowercase (id, createdAt, etc.)
 */
function normalizeBranch(branch: any): BranchI {
  if (!branch) {
    throw new Error("Cannot normalize null or undefined branch");
  }
  
  return {
    id: branch.ID !== undefined ? branch.ID : (branch.id !== undefined ? branch.id : branch.Id),
    name: branch.name || "",
    organizationId: branch.organizationId || branch.organization_id || 0,
    createdAt: branch.CreatedAt || branch.createdAt || "",
    updatedAt: branch.UpdatedAt || branch.updatedAt || "",
  };
}

export interface BranchStats {
  totalBranches: number;
  totalStudents: number;
  totalProjects: number;
}

export interface BranchGraphData {
  branch: string;
  count: number;
}

export const branchRepository = {
  /**
   * Get all branches for the current organization
   */
  getAll: async (): Promise<BranchI[]> => {
    const branches = await api.get<any[]>("/api/v1/branches");
    return Array.isArray(branches) ? branches.map(normalizeBranch) : [];
  },

  /**
   * Get branch by ID
   */
  getById: async (id: number): Promise<BranchI> => {
    const branch = await api.get<any>(`/api/v1/branches/${id}`);
    return normalizeBranch(branch);
  },

  /**
   * Create a new branch
   */
  create: async (data: { name: string }): Promise<BranchI> => {
    const branch = await api.post<any>("/api/v1/branches", data);
    return normalizeBranch(branch);
  },

  /**
   * Update a branch
   */
  update: async (id: number, data: { name: string }): Promise<BranchI> => {
    const branch = await api.put<any>(`/api/v1/branches/${id}`, data);
    return normalizeBranch(branch);
  },

  /**
   * Delete a branch
   */
  delete: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/branches/${id}`);
  },

  /**
   * Get branch statistics
   */
  getStats: async (): Promise<BranchStats> => {
    return api.get<BranchStats>("/api/v1/branches/stats/summary");
  },

  /**
   * Get students by branch graph data
   */
  getStudentsByBranch: async (): Promise<BranchGraphData[]> => {
    return api.get<BranchGraphData[]>("/api/v1/branches/stats/students-by-branch");
  },

  /**
   * Get projects by branch graph data
   */
  getProjectsByBranch: async (): Promise<BranchGraphData[]> => {
    return api.get<BranchGraphData[]>("/api/v1/branches/stats/projects-by-branch");
  },
};

