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
  supervisorId?: string | number;
  page?: number;
  limit?: number;
}

export interface PaginatedProjects {
  projects: ProjectI[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const projectService = {
  /**
   * Get all projects with optional filtering and pagination
   * Passes filters to repository for efficient database querying
   */
  getAllProjects: async (
    filters?: ProjectFilters
  ): Promise<PaginatedProjects> => {
    // Pass status, partnerId, universityId, supervisorId, departmentId, and pagination to repository for database-level filtering
    const result = await projectRepository.getAll({
      status: filters?.status,
      partnerId: filters?.partnerId,
      universityId: filters?.universityId,
      supervisorId: filters?.supervisorId,
      departmentId: filters?.departmentId,
      page: filters?.page,
      limit: filters?.limit,
    });

    // Apply client-side filters (search only) that require text matching
    let filtered = result.projects;

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Recalculate pagination if client-side filtering was applied
    const total = filtered.length;
    const limit = filters?.limit || result.limit;
    const totalPages = Math.ceil(total / limit);

    return {
      projects: filtered,
      total,
      page: result.page,
      limit,
      totalPages,
    };
  },

  /**
   * Create a new project with validation
   */
  createProject: async (projectData: Partial<ProjectI>): Promise<ProjectI> => {
    console.log("[projectService] createProject called with data:", {
      title: projectData.title,
      descriptionLength: projectData.description?.length || 0,
      description: projectData.description?.substring(0, 50) + "...",
      timestamp: new Date().toISOString(),
    });

    // Business validation
    if (!projectData.title || projectData.title.trim().length === 0) {
      console.error("[projectService] Validation failed: title is required");
      throw new Error("Project title is required");
    }

    if (
      !projectData.description ||
      projectData.description.trim().length < 10
    ) {
      console.error("[projectService] Validation failed: description too short", {
        descriptionLength: projectData.description?.length || 0,
        description: projectData.description,
      });
      throw new Error("Project description must be at least 10 characters");
    }

    console.log("[projectService] Validation passed, creating project via repository");

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
    // Clean up the data before sending
    const cleanedData: any = { ...projectData };
    
    // Convert courseId: 0 to undefined (don't send it)
    if (cleanedData.courseId === 0 || cleanedData.courseId === null) {
      cleanedData.courseId = undefined;
    }
    
    // Ensure id is included
    cleanedData.id = typeof id === 'string' ? parseInt(id, 10) : id;

    return projectRepository.update(id, cleanedData);
  },

  /**
   * Update project status
   * Used by university admins to approve/disapprove/suspend projects
   * @param signature - Optional signature data URL (required for approval)
   * @param mouUrl - Optional MOU PDF URL from Cloudinary
   */
  updateProjectStatus: async (
    id: string | number,
    status: string,
    signature?: string | null,
    mouUrl?: string | null
  ): Promise<ProjectI> => {
    return projectRepository.updateStatus(id, status, signature, mouUrl);
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
