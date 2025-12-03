/**
 * Repository for course data operations
 * Connects to backend API
 */
import { api } from "@/src/api/client";
import { CourseI } from "@/src/models/project";

export const courseRepository = {
  /**
   * Get all courses by department
   * Backend endpoint: GET /api/v1/courses?department=...
   */
  getAll: async (departmentId?: number | string): Promise<CourseI[]> => {
    const url = departmentId
      ? `/api/v1/courses?department=${departmentId}`
      : "/api/v1/courses";
    return api.get<CourseI[]>(url);
  },

  /**
   * Get course by ID
   * Note: Backend may need to add this endpoint if not available
   */
  getById: async (id: string | number): Promise<CourseI> => {
    return api.get<CourseI>(`/api/v1/courses/${id}`);
  },

  /**
   * Create new course
   * Backend endpoint: POST /api/v1/courses
   */
  create: async (course: Partial<CourseI>): Promise<CourseI> => {
    return api.post<CourseI>("/api/v1/courses", course);
  },

  /**
   * Update existing course
   * Note: Backend may need to add this endpoint if not available
   */
  update: async (
    id: string | number,
    course: Partial<CourseI>
  ): Promise<CourseI> => {
    return api.put<CourseI>(`/api/v1/courses/${id}`, course);
  },

  /**
   * Delete course
   * Note: Backend may need to add this endpoint if not available
   */
  delete: async (id: string | number): Promise<void> => {
    return api.delete(`/api/v1/courses/${id}`);
  },
};





