/**
 * Repository for group data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { GroupI } from "@/src/models/group";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const groupRepository = {
  /**
   * Get all groups
   * @param courseId - Optional filter by course
   */
  getAll: async (courseId?: number | string): Promise<GroupI[]> => {
    if (getUseMockData()) {
      const groups = await readJsonFile<GroupI>("mockGroups.json");
      if (courseId) {
        const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
        return groups.filter((g) => g.courseId === numericCourseId);
      }
      return groups;
    }
    const url = courseId
      ? `/api/groups?courseId=${courseId}`
      : "/api/groups";
    return api.get<GroupI[]>(url);
  },

  /**
   * Get group by ID
   */
  getById: async (id: number): Promise<GroupI> => {
    if (getUseMockData()) {
      const groups = await readJsonFile<GroupI>("mockGroups.json");
      const group = findById(groups, id);
      if (!group) {
        throw new Error(`Group ${id} not found`);
      }
      return group;
    }
    return api.get<GroupI>(`/api/groups/${id}`);
  },

  /**
   * Get groups by user ID (where user is leader or member)
   */
  getByUserId: async (userId: number | string): Promise<GroupI[]> => {
    if (getUseMockData()) {
      const groups = await readJsonFile<GroupI>("mockGroups.json");
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      return groups.filter(
        (g) => g.leaderId === numericUserId || g.memberIds.includes(numericUserId)
      );
    }
    return api.get<GroupI[]>(`/api/groups?userId=${userId}`);
  },

  /**
   * Create new group
   */
  create: async (group: Partial<GroupI>): Promise<GroupI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<GroupI>("/api/groups", group);
  },

  /**
   * Update group
   */
  update: async (id: number, group: Partial<GroupI>): Promise<GroupI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<GroupI>(`/api/groups/${id}`, group);
  },

  /**
   * Delete group
   */
  delete: async (id: number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/groups/${id}`);
  },
};

