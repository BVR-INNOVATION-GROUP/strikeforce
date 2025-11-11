/**
 * Service layer for project business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import { projectRepository } from "@/src/repositories/projectRepository";
import { ProjectI } from "@/src/models/project";

export interface ProjectFilters {
  status?: string;
  search?: string;
  universityId?: string;
  departmentId?: string;
  partnerId?: string | number;
}

export const projectService = {
  /**
   * Get all projects with optional filtering
   * Passes filters to repository for efficient database querying
   */
  getAllProjects: async (filters?: ProjectFilters): Promise<ProjectI[]> => {
    // Pass status, partnerId, and universityId to repository for database-level filtering
    const projects = await projectRepository.getAll({
      status: filters?.status,
      partnerId: filters?.partnerId,
      universityId: filters?.universityId,
    });

    // Apply client-side filters (search, departmentId) that require text matching
    let filtered = projects;

    if (filters?.departmentId) {
      const departmentIdNum = typeof filters.departmentId === 'string'
        ? Number(filters.departmentId)
        : filters.departmentId;
      filtered = filtered.filter(
        (p) => p.departmentId === departmentIdNum || p.departmentId === Number(departmentIdNum)
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  },

  /**
   * Create a new project with validation
   */
  createProject: async (projectData: Partial<ProjectI>): Promise<ProjectI> => {
    // Business validation
    if (!projectData.title || projectData.title.trim().length === 0) {
      throw new Error("Project title is required");
    }

    if (
      !projectData.description ||
      projectData.description.trim().length < 10
    ) {
      throw new Error("Project description must be at least 10 characters");
    }

    // Transform data for storage
    const transformedData: Partial<ProjectI> = {
      ...projectData,
      status: (projectData.status || "draft") as ProjectI["status"],
      createdAt: new Date().toISOString(),
    };

    return projectRepository.create(transformedData);
  },

  /**
   * Get project by ID
   */
  getProjectById: async (id: string | number): Promise<ProjectI> => {
    return projectRepository.getById(id);
  },

  /**
   * Update project with validation
   */
  updateProject: async (
    id: string | number,
    projectData: Partial<ProjectI>
  ): Promise<ProjectI> => {
    // Get existing project
    const existing = await projectRepository.getById(id);

    // Apply business rules for updates
    const updatedData = {
      ...existing,
      ...projectData,
      updatedAt: new Date().toISOString(),
    };

    return projectRepository.update(id, updatedData);
  },

  /**
   * Delete project
   */
  deleteProject: async (id: string | number): Promise<void> => {
    // Business validation: Check if project can be deleted
    const project = await projectRepository.getById(id);
    
    // Business rule: Cannot delete projects with active milestones or assigned applications
    // This check would need to query applications and milestones repositories
    // For now, we'll allow deletion but in production this should check dependencies
    
    return projectRepository.delete(id);
  },
};

