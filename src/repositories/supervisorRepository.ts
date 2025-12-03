/**
 * Repository for supervisor data operations
 * Connects to backend API
 * Note: Backend Supervisor module may need to be implemented
 */
import { api } from "@/src/api/client";
import {
  SupervisorRequestI,
  SupervisorCapacityI,
} from "@/src/models/supervisor";

export const supervisorRepository = {
  /**
   * Get all supervisor requests
   * @param supervisorId - Optional filter by supervisor
   * @param projectId - Optional filter by project
   * @param studentId - Optional filter by student/group
   */
  getRequests: async (
    supervisorId?: number | string,
    projectId?: number,
    studentId?: number | string
  ): Promise<SupervisorRequestI[]> => {
    const params = new URLSearchParams();
    if (supervisorId) params.append("supervisorId", String(supervisorId));
    if (projectId) params.append("projectId", String(projectId));
    if (studentId) params.append("studentId", String(studentId));
    const url = `/api/v1/supervisor-requests?${params.toString()}`;
    return api.get<SupervisorRequestI[]>(url);
  },

  /**
   * Get supervisor request by ID
   */
  getRequestById: async (id: number): Promise<SupervisorRequestI> => {
    return api.get<SupervisorRequestI>(`/api/v1/supervisor-requests/${id}`);
  },

  /**
   * Create supervisor request
   */
  createRequest: async (
    request: Partial<SupervisorRequestI>
  ): Promise<SupervisorRequestI> => {
    return api.post<SupervisorRequestI>("/api/v1/supervisor-requests", request);
  },

  /**
   * Update supervisor request
   */
  updateRequest: async (
    id: number,
    request: Partial<SupervisorRequestI>
  ): Promise<SupervisorRequestI> => {
    return api.put<SupervisorRequestI>(
      `/api/v1/supervisor-requests/${id}`,
      request
    );
  },

  /**
   * Delete supervisor request
   */
  deleteRequest: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/supervisor-requests/${id}`);
  },

  /**
   * Get supervisor capacity
   */
  getCapacity: async (supervisorId: number | string): Promise<SupervisorCapacityI> => {
    return api.get<SupervisorCapacityI>(
      `/api/v1/supervisor/${supervisorId}/capacity`
    );
  },
};

