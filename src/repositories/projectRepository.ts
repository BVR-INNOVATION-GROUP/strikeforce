/**
 * Repository for project data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { ProjectI } from "@/src/models/project";

// Environment configuration
// Default to mock data in development mode
// Can be disabled by setting NEXT_PUBLIC_USE_MOCK=false
const isDevelopment = process.env.NODE_ENV === "development";
const USE_MOCK_DATA =
  isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const projectRepository = {
  /**
   * Get all projects
   * Returns mock data in development, API data in production
   */
  getAll: async (): Promise<ProjectI[]> => {
    if (USE_MOCK_DATA) {
      // Development: Load from JSON file
      const mockData = await import("@/src/data/mockProjects.json");
      return mockData.default as ProjectI[];
    }
    // Production: Call actual API
    return api.get<ProjectI[]>("/api/projects");
  },

  /**
   * Get project by ID
   * IDs are now numeric (e.g., 1, 2, 3)
   */
  getById: async (id: string | number): Promise<ProjectI> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockProjects.json");
      const projects = mockData.default as ProjectI[];

      // Convert ID to number for comparison (URL params come as strings)
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const project = projects.find((p) => p.id === numericId);

      if (!project) {
        console.error(
          `Project ${id} not found. Available projects:`,
          projects.map((p) => p.id)
        );
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
    if (USE_MOCK_DATA) {
      // Simulate creation - in real app would persist to mock store
      const newProject = {
        id: Date.now(), // Use timestamp as numeric ID
        ...project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ProjectI;
      return newProject;
    }
    return api.post<ProjectI>("/api/projects", project);
  },

  /**
   * Update existing project
   */
  update: async (
    id: string | number,
    project: Partial<ProjectI>
  ): Promise<ProjectI> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockProjects.json");
      const projects = mockData.default as ProjectI[];
      const existing = projects.find((p) => p.id === id);
      if (!existing) {
        throw new Error(`Project ${id} not found`);
      }
      return {
        ...existing,
        ...project,
        updatedAt: new Date().toISOString(),
      } as ProjectI;
    }
    return api.put<ProjectI>(`/api/projects/${id}`, project);
  },

  /**
   * Delete project
   */
  delete: async (id: string | number): Promise<void> => {
    if (USE_MOCK_DATA) {
      return; // Simulate deletion
    }
    return api.delete(`/api/projects/${id}`);
  },
};
