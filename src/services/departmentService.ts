/**
 * Service layer for department business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import { departmentRepository } from "@/src/repositories/departmentRepository";
import { DepartmentI } from "@/src/models/project";

export const departmentService = {
  /**
   * Get all departments with optional filtering
   * @param universityId - Optional filter by university
   */
  getAllDepartments: async (
    universityId?: number | string
  ): Promise<DepartmentI[]> => {
    return departmentRepository.getAll(universityId);
  },

  /**
   * Get department by ID
   */
  getDepartmentById: async (id: string | number): Promise<DepartmentI> => {
    return departmentRepository.getById(id);
  },

  /**
   * Create a new department with validation
   */
  createDepartment: async (
    departmentData: Partial<DepartmentI>
  ): Promise<DepartmentI> => {
    // Business validation
    if (!departmentData.name || departmentData.name.trim().length === 0) {
      throw new Error("Department name is required");
    }

    if (!departmentData.universityId) {
      throw new Error("University ID is required");
    }

    // Transform data for storage
    const transformedData: Partial<DepartmentI> = {
      ...departmentData,
      createdAt: new Date().toISOString(),
    };

    return departmentRepository.create(transformedData);
  },

  /**
   * Update department with validation
   */
  updateDepartment: async (
    id: string | number,
    departmentData: Partial<DepartmentI>
  ): Promise<DepartmentI> => {
    // Get existing department
    const existing = await departmentRepository.getById(id);

    // Apply business rules for updates
    const updatedData = {
      ...existing,
      ...departmentData,
    };

    return departmentRepository.update(id, updatedData);
  },

  /**
   * Delete department
   */
  deleteDepartment: async (id: string | number): Promise<void> => {
    // Business validation: Check if department has courses
    // This check would need to query courses repository
    // For now, we'll allow deletion but in production this should check dependencies

    return departmentRepository.delete(id);
  },
};
