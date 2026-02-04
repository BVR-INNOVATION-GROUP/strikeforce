/**
 * Repository for project data operations
 * Connects to backend API
 */
import { api, BASE_URL } from "@/src/api/client";
import { ProjectI } from "@/src/models/project";

/**
 * Normalize budget from backend format (Budget object or number) to frontend format
 * Backend uses GORM embedded with prefix "budget_", so fields are: budget_currency, budget_value
 * Or it might return as Budget object: {Currency: string, Value: number}
 */
function normalizeBudget(
  budget: any,
  currency?: string,
  project?: any
): { budget: number; currency: string } {
  // Check for GORM embedded fields (budget_currency, budget_value)
  if (
    project &&
    project.budget_currency !== undefined &&
    project.budget_value !== undefined
  ) {
    return {
      budget:
        typeof project.budget_value === "number"
          ? project.budget_value
          : parseFloat(project.budget_value) || 0,
      currency: project.budget_currency || "",
    };
  }

  // Check if budget is an object (Budget struct)
  if (budget && typeof budget === "object" && !Array.isArray(budget)) {
    // Backend Budget struct: {Currency: string, Value: uint}
    const value =
      budget.Value !== undefined
        ? budget.Value
        : budget.value !== undefined
        ? budget.value
        : 0;
    const curr = budget.Currency || budget.currency || currency || "";
    return { budget: value, currency: curr };
  }
  // Check if budget is a number
  else if (typeof budget === "number") {
    return { budget, currency: currency || "" };
  }
  // Check if budget is a string (number as string)
  else if (typeof budget === "string") {
    const numValue = parseFloat(budget) || 0;
    return { budget: numValue, currency: currency || "" };
  }
  // Fallback
  else {
    return { budget: 0, currency: currency || "" };
  }
}

/**
 * Normalize a project from backend format to frontend format
 */
function normalizeProject(project: any): ProjectI {
  const normalized = normalizeBudget(project.budget, project.currency, project);

  // Map ID (uppercase from GORM) to id (lowercase for frontend)
  let projectId: number;
  if (project.id !== undefined && project.id !== null) {
    projectId =
      typeof project.id === "string" ? parseInt(project.id, 10) : project.id;
  } else if (project.ID !== undefined && project.ID !== null) {
    projectId =
      typeof project.ID === "string" ? parseInt(project.ID, 10) : project.ID;
  } else {
    throw new Error("Project must have a valid ID");
  }

  // Map universityId from department.organization if available
  let universityId: number | undefined =
    project.universityId || project.university_id;
  if (!universityId && project.department?.organization?.ID) {
    universityId = project.department.organization.ID;
  } else if (!universityId && project.department?.organization?.id) {
    universityId = project.department.organization.id;
  } else if (!universityId && project.department?.organizationId) {
    universityId = project.department.organizationId;
  }
  // Only set universityId if it's a valid number (not 0, null, or undefined)
  const finalUniversityId =
    universityId && universityId > 0 ? universityId : undefined;

  return {
    ...project,
    id: projectId,
    budget: normalized.budget,
    currency: normalized.currency,
    // Map userId to partnerId (backend uses userId, frontend expects partnerId)
    partnerId:
      project.partnerId !== undefined
        ? project.partnerId
        : project.userId !== undefined
        ? project.userId
        : project.user_id,
    // Map universityId - use undefined instead of 0 to make checks easier
    universityId: finalUniversityId,
    // Map departmentId
    departmentId:
      project.departmentId ||
      project.department_id ||
      project.department?.ID ||
      project.department?.id ||
      0,
    // Map courseId
    courseId: project.courseId || project.course_id || 0,
    // Map supervisorId
    supervisorId:
      project.supervisorId ||
      project.supervisor_id ||
      project.supervisor?.ID ||
      project.supervisor?.id,
    // Map dates
    createdAt: project.createdAt || project.CreatedAt || "",
    updatedAt: project.updatedAt || project.UpdatedAt || "",
  };
}

export const projectRepository = {
  /**
   * Get projects by owner (partner's projects)
   * Backend endpoint: GET /api/v1/projects/mine
   */
  getByOwner: async (): Promise<ProjectI[]> => {
    const projects = await api.get<any[]>("/api/v1/projects/mine");
    return projects.map(normalizeProject);
  },

  /**
   * Get all projects with pagination
   * @param filters - Optional filters for status, partnerId, universityId, pagination
   */
  getAll: async (filters?: {
    status?: string;
    partnerId?: string | number;
    universityId?: string | number;
    supervisorId?: string | number;
    departmentId?: string | number;
    page?: number;
    limit?: number;
  }): Promise<{
    projects: ProjectI[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.partnerId !== undefined) {
      queryParams.append("partnerId", String(filters.partnerId));
    }
    if (filters?.universityId !== undefined) {
      queryParams.append("universityId", String(filters.universityId));
    }
    if (filters?.supervisorId !== undefined) {
      queryParams.append("supervisorId", String(filters.supervisorId));
    }
    if (filters?.departmentId !== undefined) {
      queryParams.append("departmentId", String(filters.departmentId));
    }
    if (filters?.page !== undefined) {
      queryParams.append("page", String(filters.page));
    }
    if (filters?.limit !== undefined) {
      queryParams.append("limit", String(filters.limit));
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/api/v1/projects?${queryString}`
      : "/api/v1/projects";

    // Use raw fetch to get full response with pagination metadata
    // api.get extracts data property, but we need the full response for pagination
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const fullUrl = `${BASE_URL}${url}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const jsonResponse = await response.json();

    // Handle both paginated and non-paginated responses
    // Backend returns: { data: [...], total, page, limit, totalPages }
    if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
      const projects = jsonResponse.data.map(normalizeProject);
      const total = jsonResponse.total ?? projects.length;
      const page = jsonResponse.page ?? 1;
      const limit = jsonResponse.limit ?? projects.length;
      const totalPages = jsonResponse.totalPages ?? Math.ceil(total / limit);

      return { projects, total, page, limit, totalPages };
    } else if (Array.isArray(jsonResponse)) {
      // Fallback for non-paginated response (direct array)
      const projects = jsonResponse.map(normalizeProject);
      return {
        projects,
        total: projects.length,
        page: 1,
        limit: projects.length,
        totalPages: 1,
      };
    } else {
      throw new Error("Invalid response format from API");
    }
  },

  /**
   * Get project by ID
   * Note: Backend may need to add this endpoint if not available
   */
  getById: async (id: string | number): Promise<ProjectI> => {
    const project = await api.get<any>(`/api/v1/projects/${id}`);
    return normalizeProject(project);
  },

  /**
   * Create new project
   * Backend endpoint: POST /api/v1/projects
   */
  create: async (project: Partial<ProjectI>): Promise<ProjectI> => {
    console.log("[projectRepository] Creating project:", {
      endpoint: "/api/v1/projects",
      project: project,
      timestamp: new Date().toISOString(),
    });
    const created = await api.post<any>("/api/v1/projects", project);
    console.log("[projectRepository] Project created response:", {
      created: created,
      timestamp: new Date().toISOString(),
    });
    return normalizeProject(created);
  },

  /**
   * Update existing project
   * Backend endpoint: PUT /api/v1/projects/update
   */
  update: async (
    id: string | number,
    project: Partial<ProjectI>
  ): Promise<ProjectI> => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const updated = await api.put<any>("/api/v1/projects/update", {
      ...project,
      id: numericId,
    });
    return normalizeProject(updated);
  },

  /**
   * Update project status
   * Backend endpoint: PUT /api/v1/projects/update-status?status=...&project=...
   * @param signature - Optional signature data URL (required for approval)
   * @param mouUrl - Optional MOU PDF URL from Cloudinary
   */
  updateStatus: async (
    id: string | number,
    status: string,
    signature?: string | null,
    mouUrl?: string | null
  ): Promise<ProjectI> => {
    const body: any = {};
    if (signature) {
      body.universityAdminSignature = signature;
    }
    if (mouUrl) {
      body.mouUrl = mouUrl;
    }
    const updated = await api.put<any>(
      `/api/v1/projects/update-status?status=${status}&project=${id}`,
      Object.keys(body).length > 0 ? body : undefined
    );
    return normalizeProject(updated);
  },

  /**
   * Assign supervisor to project
   * Backend endpoint: PUT /api/v1/projects/assign-supervisor
   */
  assignSupervisor: async (
    projectId: number,
    userId: number
  ): Promise<ProjectI> => {
    const updated = await api.put<any>("/api/v1/projects/assign-supervisor", {
      projectId: projectId,
      userId: userId,
    });
    return normalizeProject(updated);
  },

  /**
   * Delete project
   * Note: Backend may need to add this endpoint if not available
   */
  delete: async (id: string | number): Promise<void> => {
    return api.delete(`/api/v1/projects/${id}`);
  },
};
