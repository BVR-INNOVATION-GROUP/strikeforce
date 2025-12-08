import { branchRepository, BranchI, BranchStats, BranchGraphData } from "@/src/repositories/branchRepository";

export const branchService = {
  /**
   * Get all branches
   */
  getAllBranches: async (): Promise<BranchI[]> => {
    return branchRepository.getAll();
  },

  /**
   * Get branch by ID
   */
  getBranchById: async (id: number): Promise<BranchI> => {
    return branchRepository.getById(id);
  },

  /**
   * Create a new branch
   */
  createBranch: async (name: string): Promise<BranchI> => {
    return branchRepository.create({ name });
  },

  /**
   * Update a branch
   */
  updateBranch: async (id: number, name: string): Promise<BranchI> => {
    return branchRepository.update(id, { name });
  },

  /**
   * Delete a branch
   */
  deleteBranch: async (id: number): Promise<void> => {
    return branchRepository.delete(id);
  },

  /**
   * Get branch statistics
   */
  getBranchStats: async (): Promise<BranchStats> => {
    return branchRepository.getStats();
  },

  /**
   * Get students by branch graph data
   */
  getStudentsByBranchData: async (): Promise<BranchGraphData[]> => {
    return branchRepository.getStudentsByBranch();
  },

  /**
   * Get projects by branch graph data
   */
  getProjectsByBranchData: async (): Promise<BranchGraphData[]> => {
    return branchRepository.getProjectsByBranch();
  },
};

