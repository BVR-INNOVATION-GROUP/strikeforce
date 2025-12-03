/**
 * Repository for department data operations
 * Connects to backend API
 */
import { api } from "@/src/api/client";
import { DepartmentI } from "@/src/models/project";

export const departmentRepository = {
  /**
   * Get all departments by organization
   * Backend endpoint: GET /api/v1/departments?universityId=...
   */
  getAll: async (universityId?: number | string): Promise<DepartmentI[]> => {
    // If universityId is provided, pass it as query parameter for partners
    const url = universityId 
      ? `/api/v1/departments?universityId=${universityId}`
      : "/api/v1/departments";
    return api.get<DepartmentI[]>(url);
  },

  /**
   * Get department by ID
   * Note: Backend may need to add this endpoint if not available
   */
  getById: async (id: string | number): Promise<DepartmentI> => {
    return api.get<DepartmentI>(`/api/v1/departments/${id}`);
  },

  /**
   * Create new department
   * Backend endpoint: POST /api/v1/departments
   */
  create: async (department: Partial<DepartmentI>): Promise<DepartmentI> => {
    return api.post<DepartmentI>("/api/v1/departments", department);
  },

  /**
   * Update existing department
   * Note: Backend may need to add this endpoint if not available
   */
  update: async (
    id: string | number,
    department: Partial<DepartmentI>
  ): Promise<DepartmentI> => {
    return api.put<DepartmentI>(`/api/v1/departments/${id}`, department);
  },

  /**
   * Delete department
   * Note: Backend may need to add this endpoint if not available
   */
  delete: async (id: string | number): Promise<void> => {
    return api.delete(`/api/v1/departments/${id}`);
  },
};





