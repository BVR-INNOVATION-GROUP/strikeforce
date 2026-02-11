/**
 * Service layer for group business logic
 * Handles group creation, member management, and validation
 * PRD Reference: Section 6 - Groups and Applications
 */
import { GroupI } from "@/src/models/group";
import { groupRepository } from "@/src/repositories/groupRepository";
import { userRepository } from "@/src/repositories/userRepository";

export const groupService = {
  /**
   * Get all groups for the authenticated user (where user is leader or member)
   * Backend uses JWT token's user_id - never pass userId parameter
   * @returns Array of groups
   */
  getUserGroups: async (): Promise<GroupI[]> => {
    return groupRepository.getByUserId();
  },

  /**
   * Get group by ID
   * @param id - Group ID
   * @returns Group or throws error if not found
   */
  getGroupById: async (id: number | string): Promise<GroupI> => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    return groupRepository.getById(numericId);
  },

  /**
   * Create a new group
   * Business rules:
   * - Validate capacity (2-10 members)
   * - Ensure leader is in memberIds
   * - Validate all members are students from same course
   * @param groupData - Group data
   * @returns Created group
   * @throws Error if validation fails
   */
  createGroup: async (groupData: Partial<GroupI>): Promise<GroupI> => {
    console.log(
      "[groupService.createGroup] Starting group creation with data:",
      groupData
    );

    // Basic client-side validation (backend will do full validation)
    if (!groupData.courseId) {
      throw new Error("Course ID is required");
    }

    if (!groupData.leaderId) {
      throw new Error("Leader ID is required");
    }

    if (!groupData.name || groupData.name.trim().length === 0) {
      throw new Error("Group name is required");
    }

    if (
      !groupData.capacity ||
      groupData.capacity < 2 ||
      groupData.capacity > 10
    ) {
      throw new Error("Capacity must be between 2 and 10");
    }

    // Validate member IDs are valid numbers (fix NaN issue)
    const memberIds = groupData.memberIds || [];
    const validMemberIds = memberIds
      .map((id) => {
        if (typeof id === "string") {
          const parsed = parseInt(id, 10);
          if (isNaN(parsed)) {
            console.error("Invalid member ID:", id);
            return null;
          }
          return parsed;
        }
        return typeof id === "number" && !isNaN(id) ? id : null;
      })
      .filter((id): id is number => id !== null && !isNaN(id));

    if (memberIds.length > 0 && validMemberIds.length !== memberIds.length) {
      console.warn("Some member IDs were invalid and filtered out", {
        original: memberIds,
        valid: validMemberIds,
      });
    }

    // Convert leaderId to number
    const numericLeaderId =
      typeof groupData.leaderId === "string"
        ? parseInt(groupData.leaderId, 10)
        : groupData.leaderId;
    if (isNaN(numericLeaderId)) {
      throw new Error("Invalid leader ID");
    }

    // Ensure leader is in memberIds
    const allMemberIds = validMemberIds.includes(numericLeaderId)
      ? validMemberIds
      : [numericLeaderId, ...validMemberIds];

    // Prepare data for API call - backend will validate everything
    const groupPayload = {
      courseId:
        typeof groupData.courseId === "string"
          ? parseInt(groupData.courseId, 10)
          : groupData.courseId,
      leaderId: numericLeaderId,
      memberIds: allMemberIds,
      name: groupData.name.trim(),
      capacity: groupData.capacity,
    };

    console.log(
      "Creating group with payload (backend will validate):",
      groupPayload
    );

    // Create group via repository - backend handles all validation
    try {
      const result = await groupRepository.create(groupPayload);
      console.log("Group created successfully:", result);
      return result;
    } catch (error) {
      console.error("Failed to create group via API:", error);
      throw error;
    }
  },

  /**
   * Update group
   * Business rules:
   * - Validate capacity if changed
   * - Ensure leader remains in memberIds
   * @param id - Group ID
   * @param updates - Partial group data
   * @returns Updated group
   * @throws Error if validation fails
   */
  updateGroup: async (
    id: number | string,
    updates: Partial<GroupI>
  ): Promise<GroupI> => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const existingGroup = await groupRepository.getById(numericId);

    // Validate capacity if provided
    if (updates.capacity !== undefined) {
      if (updates.capacity < 2 || updates.capacity > 10) {
        throw new Error("Capacity must be between 2 and 10");
      }

      const memberIds = updates.memberIds || existingGroup.memberIds;
      if (memberIds.length > updates.capacity) {
        throw new Error(
          `Current members (${memberIds.length}) exceed new capacity (${updates.capacity})`
        );
      }
    }

    // Ensure leader remains in memberIds if memberIds is updated
    if (updates.memberIds !== undefined) {
      const leaderId =
        updates.leaderId !== undefined
          ? typeof updates.leaderId === "string"
            ? parseInt(updates.leaderId, 10)
            : updates.leaderId
          : existingGroup.leaderId;

      const allMemberIds = updates.memberIds.includes(leaderId)
        ? updates.memberIds
        : [leaderId, ...updates.memberIds];

      updates.memberIds = allMemberIds;
    }

    // Update via repository (handles API call)
    return groupRepository.update(numericId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Delete group
   * @param id - Group ID
   * @throws Error if group not found
   */
  deleteGroup: async (id: number | string): Promise<void> => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    // Verify group exists
    await groupRepository.getById(numericId);

    // Delete via repository (handles API call)
    return groupRepository.delete(numericId);
  },

  /**
   * Add members to group
   * Business rules:
   * - Validate capacity not exceeded
   * - Validate members are students from same course
   * @param id - Group ID
   * @param memberIds - Array of member IDs to add
   * @returns Updated group
   * @throws Error if validation fails
   */
  addMembers: async (
    id: number | string,
    memberIds: (number | string)[]
  ): Promise<GroupI> => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      throw new Error("Invalid group ID");
    }

    const group = await groupRepository.getById(numericId);

    // Convert to numeric IDs with validation (fix NaN issue)
    const numericMemberIds = memberIds
      .map((id) => {
        if (typeof id === "string") {
          const parsed = parseInt(id, 10);
          if (isNaN(parsed)) {
            console.error("Invalid member ID:", id);
            return null;
          }
          return parsed;
        }
        return typeof id === "number" && !isNaN(id) ? id : null;
      })
      .filter((id): id is number => id !== null && !isNaN(id));

    if (numericMemberIds.length === 0) {
      throw new Error("No valid member IDs provided");
    }

    if (numericMemberIds.length !== memberIds.length) {
      console.warn("Some member IDs were invalid and filtered out", {
        original: memberIds,
        valid: numericMemberIds,
      });
    }

    // Normalize existing member IDs to numbers (API may return number[] or string[])
    const existingMemberIds = (group.memberIds ?? []).map((id) =>
      typeof id === "string" ? parseInt(id, 10) : Number(id)
    ).filter((n) => !Number.isNaN(n));

    const newMemberIds = numericMemberIds.filter(
      (id) => !existingMemberIds.includes(id)
    );

    if (newMemberIds.length === 0) {
      throw new Error("All members are already in the group");
    }

    // Prepare update payload - backend expects memberIds (leader + members), validates capacity
    const updatedMemberIds = [...existingMemberIds, ...newMemberIds];
    console.log("Updating group with members (backend will validate):", {
      groupId: numericId,
      updatedMemberIds,
      totalMembers: updatedMemberIds.length,
    });

    // Update group with new members - backend handles validation
    const result = await groupRepository.update(numericId, {
      memberIds: updatedMemberIds,
    });
    console.log("Group updated successfully:", result);
    return result;
  },

  /**
   * Remove member from group
   * Business rules:
   * - Cannot remove leader
   * - Must have at least 2 members (leader + 1)
   * @param id - Group ID
   * @param memberId - Member ID to remove
   * @returns Updated group
   * @throws Error if validation fails
   */
  removeMember: async (
    id: number | string,
    memberId: number | string
  ): Promise<GroupI> => {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const numericMemberId =
      typeof memberId === "string" ? parseInt(memberId, 10) : memberId;
    const group = await groupRepository.getById(numericId);

    // Cannot remove leader
    if (group.leaderId === numericMemberId) {
      throw new Error("Cannot remove the group leader");
    }

    // Must have at least 2 members
    if (group.memberIds.length <= 2) {
      throw new Error("Group must have at least 2 members");
    }

    // Remove member
    const updatedMemberIds = group.memberIds.filter(
      (id) => id !== numericMemberId
    );

    return groupRepository.update(numericId, {
      memberIds: updatedMemberIds,
    });
  },
};
