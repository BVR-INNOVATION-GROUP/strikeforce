/**
 * Repository for group data operations
 * Connects to backend API
 * Note: Groups are managed via /user/group endpoints
 */
import { api } from "@/src/api/client";
import { GroupI } from "@/src/models/group";

export const groupRepository = {
  /**
   * Get all groups
   * @param courseId - Optional filter by course
   * @param userId - Optional filter by user ID (for university-admins viewing student details)
   * Note: Backend may need to add this endpoint if not available
   */
  getAll: async (courseId?: number | string, userId?: number): Promise<GroupI[]> => {
    const params = new URLSearchParams();
    if (courseId) {
      params.append("courseId", courseId.toString());
    }
    if (userId) {
      params.append("userId", userId.toString());
    }
    const url = params.toString()
      ? `/api/v1/groups?${params.toString()}`
      : "/api/v1/groups";
    return api.get<GroupI[]>(url);
  },

  /**
   * Get group by ID
   * Note: Backend may need to add this endpoint if not available
   */
  getById: async (id: number): Promise<GroupI> => {
    return api.get<GroupI>(`/api/v1/groups/${id}`);
  },

  /**
   * Get groups for the authenticated user (where user is leader or member)
   * Backend uses JWT token's user_id - never pass userId parameter
   */
  getByUserId: async (): Promise<GroupI[]> => {
    return api.get<GroupI[]>("/api/v1/groups");
  },

  /**
   * Create new group
   * Backend endpoint: POST /user/group
   */
  create: async (group: Partial<GroupI>): Promise<GroupI> => {
    return api.post<GroupI>("/user/group", group);
  },

  /**
   * Add user to group
   * Backend endpoint: POST /user/group/add
   */
  addMember: async (groupId: number, userId: number): Promise<void> => {
    return api.post("/user/group/add", { group_id: groupId, user_id: userId });
  },

  /**
   * Remove user from group
   * Backend endpoint: POST /user/group/remove
   */
  removeMember: async (groupId: number, userId: number): Promise<void> => {
    return api.post("/user/group/remove", {
      group_id: groupId,
      user_id: userId,
    });
  },

  /**
   * Update group
   * Note: Backend may need to add this endpoint if not available
   */
  update: async (id: number, group: Partial<GroupI>): Promise<GroupI> => {
    console.log("[groupRepository.update] Making API call:", {
      id,
      url: `/api/v1/groups/${id}`,
      payload: group,
    });
    const result = await api.put<GroupI>(`/api/v1/groups/${id}`, group);
    console.log("[groupRepository.update] API call successful:", result);
    return result;
  },

  /**
   * Delete group
   * Note: Backend may need to add this endpoint if not available
   */
  delete: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/groups/${id}`);
  },
};
