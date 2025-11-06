/**
 * Repository for department data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { DepartmentI } from "@/src/models/project";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const departmentRepository = {
  /**
   * Get all departments
   * @param universityId - Optional filter by university
   */
  getAll: async (universityId?: number | string): Promise<DepartmentI[]> => {
    if (getUseMockData()) {
      const departments = await readJsonFile<DepartmentI>("mockDepartments.json");
      if (universityId) {
        const numericUniversityId = typeof universityId === 'string' ? parseInt(universityId, 10) : universityId;
        return departments.filter((d) => d.universityId === numericUniversityId);
      }
      return departments;
    }
    const url = universityId
      ? `/api/departments?universityId=${universityId}`
      : "/api/departments";
    return api.get<DepartmentI[]>(url);
  },

  /**
   * Get department by ID
   */
  getById: async (id: string | number): Promise<DepartmentI> => {
    if (getUseMockData()) {
      const departments = await readJsonFile<DepartmentI>("mockDepartments.json");
      const department = findById(departments, id);
      if (!department) {
        throw new Error(`Department ${id} not found`);
      }
      return department;
    }
    return api.get<DepartmentI>(`/api/departments/${id}`);
  },

  /**
   * Create new department
   */
  create: async (department: Partial<DepartmentI>): Promise<DepartmentI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<DepartmentI>("/api/departments", department);
  },

  /**
   * Update existing department
   */
  update: async (
    id: string | number,
    department: Partial<DepartmentI>
  ): Promise<DepartmentI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<DepartmentI>(`/api/departments/${id}`, department);
  },

  /**
   * Delete department
   */
  delete: async (id: string | number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/departments/${id}`);
  },
};

