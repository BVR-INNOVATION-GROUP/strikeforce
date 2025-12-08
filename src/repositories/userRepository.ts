/**
 * Repository for user data operations
 * Connects to backend API
 * Note: User endpoints are at /user/* (not /api/v1/*)
 */
import { api } from "@/src/api/client";
import { UserI } from "@/src/models/user";

export const userRepository = {
  /**
   * Get current user
   * Backend endpoint: GET /user/
   */
  getCurrent: async (): Promise<UserI> => {
    return api.get<UserI>("/user/");
  },

  /**
   * Get user by ID
   * Note: Backend may need to add this endpoint if not available
   */
  getById: async (id: string | number): Promise<UserI> => {
    return api.get<UserI>(`/user/${id}`);
  },

  /**
   * Get all users
   * Backend endpoint: GET /user/all
   */
  getAll: async (): Promise<UserI[]> => {
    return api.get<UserI[]>("/user/all");
  },

  /**
   * Get users by role
   * Backend endpoint: GET /user/all?role={role}
   * (GET /user only returns the authenticated user, so we must hit /all)
   */
  getByRole: async (role: string): Promise<UserI[]> => {
    const queryRole = encodeURIComponent(role);
    return api.get<UserI[]>(`/user/all?role=${queryRole}`);
  },

  /**
   * Search users with filters
   * Backend endpoint: GET /user/search?role={role}&search={query}&limit={limit}
   * @param role - Required: user role to filter by
   * @param search - Optional: search query for name/email
   * @param limit - Optional: max results (default 50, max 100)
   */
  search: async (params: {
    role: string;
    search?: string;
    limit?: number;
  }): Promise<UserI[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append("role", params.role);
    if (params.search) {
      queryParams.append("search", params.search);
    }
    if (params.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    return api.get<UserI[]>(`/user/search?${queryParams.toString()}`);
  },

  /**
   * Create new user (signup)
   * Backend endpoint: POST /user/signup
   */
  create: async (user: Partial<UserI>): Promise<UserI> => {
    return api.post<UserI>("/user/signup", user);
  },

  /**
   * Update current authenticated user (uses token's user_id)
   * Backend endpoint: PUT /user/
   */
  updateCurrent: async (user: Partial<UserI>): Promise<UserI> => {
    return api.put<UserI>("/user/", user);
  },

  /**
   * Update user by ID (admin only)
   * Backend endpoint: PUT /user/:id
   */
  update: async (id: string | number, user: Partial<UserI>): Promise<UserI> => {
    return api.put<UserI>(`/user/${id}`, user);
  },

  /**
   * Delete user
   * Note: Backend may need to add this endpoint if not available
   */
  delete: async (id: string | number): Promise<void> => {
    return api.delete(`/user/${id}`);
  },
};
