/**
 * Repository for supervisor data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import {
  SupervisorRequestI,
  SupervisorCapacityI,
} from "@/src/models/supervisor";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const supervisorRepository = {
  /**
   * Get all supervisor requests
   * @param supervisorId - Optional filter by supervisor
   * @param projectId - Optional filter by project
   */
  getRequests: async (
    supervisorId?: number | string,
    projectId?: number
  ): Promise<SupervisorRequestI[]> => {
    if (getUseMockData()) {
      let requests = await readJsonFile<SupervisorRequestI>("mockSupervisorRequests.json");
      if (supervisorId) {
        const numericSupervisorId = typeof supervisorId === 'string' ? parseInt(supervisorId, 10) : supervisorId;
        requests = requests.filter((r) => r.supervisorId === numericSupervisorId);
      }
      if (projectId) {
        requests = requests.filter((r) => r.projectId === projectId);
      }
      return requests;
    }
    const params = new URLSearchParams();
    if (supervisorId) params.append("supervisorId", supervisorId);
    if (projectId) params.append("projectId", projectId.toString());
    const url = `/api/supervisor/requests?${params.toString()}`;
    return api.get<SupervisorRequestI[]>(url);
  },

  /**
   * Get supervisor request by ID
   */
  getRequestById: async (id: number): Promise<SupervisorRequestI> => {
    if (getUseMockData()) {
      const requests = await readJsonFile<SupervisorRequestI>("mockSupervisorRequests.json");
      const request = findById(requests, id);
      if (!request) {
        throw new Error(`Supervisor request ${id} not found`);
      }
      return request;
    }
    return api.get<SupervisorRequestI>(`/api/supervisor/requests/${id}`);
  },

  /**
   * Create supervisor request
   */
  createRequest: async (
    request: Partial<SupervisorRequestI>
  ): Promise<SupervisorRequestI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<SupervisorRequestI>("/api/supervisor/requests", request);
  },

  /**
   * Update supervisor request
   */
  updateRequest: async (
    id: number,
    request: Partial<SupervisorRequestI>
  ): Promise<SupervisorRequestI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<SupervisorRequestI>(
      `/api/supervisor/requests/${id}`,
      request
    );
  },

  /**
   * Delete supervisor request
   */
  deleteRequest: async (id: number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/supervisor/requests/${id}`);
  },

  /**
   * Get supervisor capacity
   */
  getCapacity: async (supervisorId: number | string): Promise<SupervisorCapacityI> => {
    if (getUseMockData()) {
      // Calculate from requests
      const requests = await supervisorRepository.getRequests(supervisorId);
      const activeCount = requests.filter(
        (r) => r.status === "APPROVED"
      ).length;
      const numericSupervisorId = typeof supervisorId === 'string' ? parseInt(supervisorId, 10) : supervisorId;
      return {
        supervisorId: numericSupervisorId,
        maxActive: 10, // Default capacity
        currentActive: activeCount,
      };
    }
    return api.get<SupervisorCapacityI>(
      `/api/supervisor/${supervisorId}/capacity`
    );
  },
};

