/**
 * Repository for project data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { ProjectI } from "@/src/models/project";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const projectRepository = {
  /**
   * Get all projects
   * Returns mock data in development, API data in production
   */
  getAll: async (): Promise<ProjectI[]> => {
    if (getUseMockData()) {
      // Development: Load from JSON file
      return await readJsonFile<ProjectI>("mockProjects.json");
    }
    // Production: Call actual API
    return api.get<ProjectI[]>("/api/projects");
  },

  /**
   * Get project by ID
   * IDs are now numeric (e.g., 1, 2, 3)
   */
  getById: async (id: string | number): Promise<ProjectI> => {
    if (getUseMockData()) {
      const projects = await readJsonFile<ProjectI>("mockProjects.json");
      const project = findById(projects, id);
      if (!project) {
        throw new Error(`Project ${id} not found`);
      }
      return project;
    }
    return api.get<ProjectI>(`/api/projects/${id}`);
  },

  /**
   * Create new project
   */
  create: async (project: Partial<ProjectI>): Promise<ProjectI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<ProjectI>("/api/projects", project);
  },

  /**
   * Update existing project
   */
  update: async (
    id: string | number,
    project: Partial<ProjectI>
  ): Promise<ProjectI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<ProjectI>(`/api/projects/${id}`, project);
  },

  /**
   * Delete project
   */
  delete: async (id: string | number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/projects/${id}`);
  },
};
