/**
 * Service layer for course business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import { courseRepository } from "@/src/repositories/courseRepository";
import { CourseI } from "@/src/models/project";

export const courseService = {
  /**
   * Get all courses with optional filtering
   * @param departmentId - Optional filter by department
   */
  getAllCourses: async (departmentId?: number | string): Promise<CourseI[]> => {
    return courseRepository.getAll(departmentId);
  },

  /**
   * Get course by ID
   */
  getCourseById: async (id: string | number): Promise<CourseI> => {
    return courseRepository.getById(id);
  },

  /**
   * Create a new course with validation
   */
  createCourse: async (courseData: Partial<CourseI>): Promise<CourseI> => {
    // Business validation
    if (!courseData.name || courseData.name.trim().length === 0) {
      throw new Error("Course name is required");
    }

    if (!courseData.departmentId) {
      throw new Error("Department ID is required");
    }

    // Transform data for storage
    const transformedData: Partial<CourseI> = {
      ...courseData,
      createdAt: new Date().toISOString(),
    };

    return courseRepository.create(transformedData);
  },

  /**
   * Update course with validation
   */
  updateCourse: async (
    id: string | number,
    courseData: Partial<CourseI>
  ): Promise<CourseI> => {
    // Get existing course
    const existing = await courseRepository.getById(id);

    // Apply business rules for updates
    const updatedData = {
      ...existing,
      ...courseData,
    };

    return courseRepository.update(id, updatedData);
  },

  /**
   * Delete course
   */
  deleteCourse: async (id: string | number): Promise<void> => {
    // Business validation: Check if course has active projects or groups
    // This check would need to query projects and groups repositories
    // For now, we'll allow deletion but in production this should check dependencies
    
    return courseRepository.delete(id);
  },
};





