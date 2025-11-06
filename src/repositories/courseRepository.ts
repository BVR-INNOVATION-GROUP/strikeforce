/**
 * Repository for course data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { CourseI } from "@/src/models/project";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const courseRepository = {
  /**
   * Get all courses
   * @param departmentId - Optional filter by department
   */
  getAll: async (departmentId?: number | string): Promise<CourseI[]> => {
    if (getUseMockData()) {
      const courses = await readJsonFile<CourseI>("mockCourses.json");
      if (departmentId) {
        const numericDepartmentId = typeof departmentId === 'string' ? parseInt(departmentId, 10) : departmentId;
        return courses.filter((c) => c.departmentId === numericDepartmentId);
      }
      return courses;
    }
    const url = departmentId
      ? `/api/courses?departmentId=${departmentId}`
      : "/api/courses";
    return api.get<CourseI[]>(url);
  },

  /**
   * Get course by ID
   */
  getById: async (id: string | number): Promise<CourseI> => {
    if (getUseMockData()) {
      const courses = await readJsonFile<CourseI>("mockCourses.json");
      const course = findById(courses, id);
      if (!course) {
        throw new Error(`Course ${id} not found`);
      }
      return course;
    }
    return api.get<CourseI>(`/api/courses/${id}`);
  },

  /**
   * Create new course
   */
  create: async (course: Partial<CourseI>): Promise<CourseI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<CourseI>("/api/courses", course);
  },

  /**
   * Update existing course
   */
  update: async (
    id: string | number,
    course: Partial<CourseI>
  ): Promise<CourseI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<CourseI>(`/api/courses/${id}`, course);
  },

  /**
   * Delete course
   */
  delete: async (id: string | number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/courses/${id}`);
  },
};

