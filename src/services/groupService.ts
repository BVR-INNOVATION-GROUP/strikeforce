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
   * Get all groups for a user (where user is leader or member)
   * @param userId - User ID
   * @returns Array of groups
   */
  getUserGroups: async (userId: string | number): Promise<GroupI[]> => {
    return groupRepository.getByUserId(userId);
  },

  /**
   * Get group by ID
   * @param id - Group ID
   * @returns Group or throws error if not found
   */
  getGroupById: async (id: number | string): Promise<GroupI> => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
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
    // Business validation
    if (!groupData.courseId) {
      throw new Error("Course ID is required");
    }

    if (!groupData.leaderId) {
      throw new Error("Leader ID is required");
    }

    if (!groupData.name || groupData.name.trim().length === 0) {
      throw new Error("Group name is required");
    }

    if (!groupData.capacity || groupData.capacity < 2 || groupData.capacity > 10) {
      throw new Error("Capacity must be between 2 and 10");
    }

    // Validate members are from same course
    const memberIds = groupData.memberIds || [];
    const totalMembers = 1 + memberIds.length; // Leader + members

    if (totalMembers > groupData.capacity) {
      throw new Error(`Total members (${totalMembers}) exceeds capacity (${groupData.capacity})`);
    }

    // Validate all members exist and are students from same course
    if (memberIds.length > 0) {
      const users = await userRepository.getAll();
      const numericLeaderId = typeof groupData.leaderId === 'string' ? parseInt(groupData.leaderId, 10) : groupData.leaderId;
      const leader = users.find((u) => {
        const userId = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id;
        return userId === numericLeaderId;
      });

      if (!leader || leader.role !== "student") {
        throw new Error("Leader must be a student");
      }

      const numericCourseId = typeof groupData.courseId === 'string' ? parseInt(groupData.courseId, 10) : groupData.courseId;

      for (const memberId of memberIds) {
        const numericMemberId = typeof memberId === 'string' ? parseInt(memberId, 10) : memberId;
        const member = users.find((u) => {
          const userId = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id;
          return userId === numericMemberId;
        });

        if (!member || member.role !== "student") {
          throw new Error(`Member ${memberId} must be a student`);
        }

        const memberCourseId = typeof member.courseId === 'string' ? parseInt(member.courseId, 10) : member.courseId;
        if (memberCourseId !== numericCourseId) {
          throw new Error(`Member ${memberId} must be from the same course as the leader`);
        }
      }
    }

    // Ensure leader is in memberIds
    const numericLeaderId = typeof groupData.leaderId === 'string' ? parseInt(groupData.leaderId, 10) : groupData.leaderId;
    const allMemberIds = memberIds.includes(numericLeaderId)
      ? memberIds
      : [numericLeaderId, ...memberIds];

    // Create group via repository (handles API call)
    return groupRepository.create({
      courseId: groupData.courseId,
      leaderId: groupData.leaderId,
      memberIds: allMemberIds,
      name: groupData.name.trim(),
      capacity: groupData.capacity,
    });
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
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const existingGroup = await groupRepository.getById(numericId);

    // Validate capacity if provided
    if (updates.capacity !== undefined) {
      if (updates.capacity < 2 || updates.capacity > 10) {
        throw new Error("Capacity must be between 2 and 10");
      }

      const memberIds = updates.memberIds || existingGroup.memberIds;
      if (memberIds.length > updates.capacity) {
        throw new Error(`Current members (${memberIds.length}) exceed new capacity (${updates.capacity})`);
      }
    }

    // Ensure leader remains in memberIds if memberIds is updated
    if (updates.memberIds !== undefined) {
      const leaderId = updates.leaderId !== undefined
        ? (typeof updates.leaderId === 'string' ? parseInt(updates.leaderId, 10) : updates.leaderId)
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
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
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
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const group = await groupRepository.getById(numericId);

    // Convert to numeric IDs
    const numericMemberIds = memberIds.map((id) =>
      typeof id === 'string' ? parseInt(id, 10) : id
    );

    // Check for duplicates
    const existingMemberIds = group.memberIds;
    const newMemberIds = numericMemberIds.filter(
      (id) => !existingMemberIds.includes(id)
    );

    if (newMemberIds.length === 0) {
      throw new Error("All members are already in the group");
    }

    // Validate capacity
    const totalMembers = existingMemberIds.length + newMemberIds.length;
    if (totalMembers > group.capacity) {
      throw new Error(
        `Adding ${newMemberIds.length} member(s) would exceed capacity (${group.capacity})`
      );
    }

    // Validate members are students from same course
    const users = await userRepository.getAll();
    const numericCourseId = typeof group.courseId === 'string' ? parseInt(group.courseId, 10) : group.courseId;

    for (const memberId of newMemberIds) {
      const member = users.find((u) => {
        const userId = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id;
        return userId === memberId;
      });

      if (!member || member.role !== "student") {
        throw new Error(`Member ${memberId} must be a student`);
      }

      const memberCourseId = typeof member.courseId === 'string' ? parseInt(member.courseId, 10) : member.courseId;
      if (memberCourseId !== numericCourseId) {
        throw new Error(`Member ${memberId} must be from the same course as the group`);
      }
    }

    // Update group with new members
    return groupRepository.update(numericId, {
      memberIds: [...existingMemberIds, ...newMemberIds],
    });
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
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const numericMemberId = typeof memberId === 'string' ? parseInt(memberId, 10) : memberId;
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
    const updatedMemberIds = group.memberIds.filter((id) => id !== numericMemberId);

    return groupRepository.update(numericId, {
      memberIds: updatedMemberIds,
    });
  },
};


