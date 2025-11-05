/**
 * Repository for user data operations
 */
import { api } from "@/src/api/client";
import { UserI } from "@/src/models/user";

// Default to mock data in development mode
// Can be disabled by setting NEXT_PUBLIC_USE_MOCK=false
const isDevelopment = process.env.NODE_ENV === "development";
const USE_MOCK_DATA =
  isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const userRepository = {
  getAll: async (): Promise<UserI[]> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockUsers.json");
      return mockData.default as UserI[];
    }
    return api.get<UserI[]>("/api/users");
  },

  getById: async (id: string): Promise<UserI> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockUsers.json");
      const users = mockData.default as UserI[];
      const user = users.find((u) => u.id === id);
      if (!user) {
        throw new Error(`User ${id} not found`);
      }
      return user;
    }
    return api.get<UserI>(`/api/users/${id}`);
  },

  getByRole: async (role: string): Promise<UserI[]> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockUsers.json");
      const users = mockData.default as UserI[];
      return users.filter((u) => u.role === role);
    }
    return api.get<UserI[]>(`/api/users?role=${role}`);
  },

  update: async (id: string, user: Partial<UserI>): Promise<UserI> => {
    if (USE_MOCK_DATA) {
      const existing = await userRepository.getById(id);
      return { ...existing, ...user, updatedAt: new Date().toISOString() };
    }
    return api.put<UserI>(`/api/users/${id}`, user);
  },
};

