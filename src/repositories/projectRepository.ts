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
   * @param filters - Optional filters for status, partnerId, universityId
   */
  getAll: async (filters?: {
    status?: string;
    partnerId?: string | number;
    universityId?: string | number;
  }): Promise<ProjectI[]> => {
    if (getUseMockData()) {
      // Development: Load from JSON file
      const projects = await readJsonFile<ProjectI>("mockProjects.json");
      
      // Apply filters to mock data
      if (filters) {
        let filtered = projects;
        if (filters.status) {
          filtered = filtered.filter((p) => p.status === filters.status);
        }
        if (filters.partnerId !== undefined) {
          const partnerIdNum = typeof filters.partnerId === 'string' 
            ? Number(filters.partnerId) 
            : filters.partnerId;
          filtered = filtered.filter(
            (p) => p.partnerId === partnerIdNum || p.partnerId === Number(partnerIdNum)
          );
        }
        if (filters.universityId !== undefined) {
          const universityIdNum = typeof filters.universityId === 'string'
            ? Number(filters.universityId)
            : filters.universityId;
          filtered = filtered.filter(
            (p) => p.universityId === universityIdNum || p.universityId === Number(universityIdNum)
          );
        }
        return filtered;
      }
      return projects;
    }
    
    // Production: Call actual API with query parameters
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.partnerId !== undefined) {
      queryParams.append('partnerId', String(filters.partnerId));
    }
    if (filters?.universityId !== undefined) {
      queryParams.append('universityId', String(filters.universityId));
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/projects?${queryString}` : "/api/projects";
    return api.get<ProjectI[]>(url);
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
