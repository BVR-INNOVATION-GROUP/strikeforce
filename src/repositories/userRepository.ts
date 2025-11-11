/**
 * Repository for user data operations
 */
import { api } from "@/src/api/client";
import { UserI } from "@/src/models/user";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const userRepository = {
  getAll: async (): Promise<UserI[]> => {
    if (getUseMockData()) {
      return await readJsonFile<UserI>("mockUsers.json");
    }
    return api.get<UserI[]>("/api/users");
  },

  getById: async (id: string | number): Promise<UserI> => {
    if (getUseMockData()) {
      const users = await readJsonFile<UserI>("mockUsers.json");
      const user = findById(users, id);
      if (!user) {
        throw new Error(`User ${id} not found`);
      }
      return user;
    }
    return api.get<UserI>(`/api/users/${id}`);
  },

  getByRole: async (role: string): Promise<UserI[]> => {
    if (getUseMockData()) {
      const users = await readJsonFile<UserI>("mockUsers.json");
      return users.filter((u) => u.role === role);
    }
    return api.get<UserI[]>(`/api/users?role=${role}`);
  },

  /**
   * Create new user
   */
  create: async (user: Partial<UserI>): Promise<UserI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<UserI>("/api/users", user);
  },

  update: async (id: string | number, user: Partial<UserI>): Promise<UserI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<UserI>(`/api/users/${id}`, user);
  },

  /**
   * Delete user
   */
  delete: async (id: string | number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/users/${id}`);
  },
};

