"use client";

import React, { useEffect, useState } from "react";
import Button from "@/src/components/core/Button";
import { GroupI } from "@/src/models/group";
import { useAuthStore } from "@/src/store";
import { Plus } from "lucide-react";
import { useToast } from "@/src/hooks/useToast";
import GroupCard from "@/src/components/screen/student/groups/GroupCard";
import CreateGroupModal from "@/src/components/screen/student/groups/CreateGroupModal";
import GroupDetailsModal from "@/src/components/screen/student/groups/GroupDetailsModal";
import InviteMemberModal from "@/src/components/screen/student/groups/InviteMemberModal";
import GroupsEmptyState from "@/src/components/screen/student/groups/GroupsEmptyState";
import { useStudentGroupsData } from "@/src/hooks/useStudentGroupsData";
import { useGroupCreation } from "@/src/hooks/useGroupCreation";

/**
 * Student Groups - create and manage groups for project applications
 */
export default function StudentGroups() {
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { groups, users, loading } = useStudentGroupsData(user?.id ? String(user.id) : null);
  const [localGroups, setLocalGroups] = useState(groups);

  const {
    formData,
    errors,
    availableMembers,
    usersMap,
    setFormData,
    updateMembers,
    clearError,
    handleCreateGroup,
  } = useGroupCreation(isCreateModalOpen, user?.id ? String(user.id) : null);

  useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

  const handleCreate = async () => {
    if (!user) return;
    try {
      await handleCreateGroup(String(user.id), user.courseId ? String(user.courseId) : undefined, (newGroup) => {
        setLocalGroups([...localGroups, newGroup]);
        setIsCreateModalOpen(false);
      });
    } catch (error) {
      // Error already handled in hook
      console.error("Failed to create group:", error);
    }
  };

  /**
   * Get selected group for details modal
   */
  const selectedGroup = selectedGroupId
    ? localGroups.find((g) => String(g.id) === selectedGroupId)
    : null;

  /**
   * Get group for invite modal
   * Uses selectedGroupId to find the group, or stays open if already set
   */
  const inviteGroup = isInviteModalOpen && selectedGroupId
    ? localGroups.find((g) => String(g.id) === selectedGroupId) || null
    : null;

  /**
   * Handle invite member button click
   */
  const handleInviteMember = (groupId: string) => {
    setSelectedGroupId(String(groupId));
    setIsInviteModalOpen(true);
  };

  /**
   * Handle view details button click
   */
  const handleViewDetails = (groupId: string) => {
    setSelectedGroupId(String(groupId));
  };

  /**
   * Handle invite members submission
   */
  const handleInviteMembers = async (groupId: string, memberIds: string[]) => {
    try {
      const { groupService } = await import("@/src/services/groupService");
      const numericGroupId = parseInt(groupId, 10);
      const numericMemberIds = memberIds.map((id) => parseInt(id, 10));

      // Use groupService to add members with business validation
      const updatedGroup = await groupService.addMembers(numericGroupId, numericMemberIds);

      // Update local state
      const groupIndex = localGroups.findIndex((g) => String(g.id) === groupId);
      if (groupIndex !== -1) {
        const updatedGroups = [...localGroups];
        updatedGroups[groupIndex] = updatedGroup;
        setLocalGroups(updatedGroups);
      }

      showSuccess(
        `Successfully invited ${memberIds.length} member${memberIds.length !== 1 ? "s" : ""}`
      );
    } catch (error) {
      console.error("Failed to invite members:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to invite members. Please try again."
      );
      throw error;
    }
  };

  /**
   * Handle remove member from group
   */
  const handleRemoveMember = async (groupId: string, memberId: string) => {
    try {
      const { groupService } = await import("@/src/services/groupService");
      const numericGroupId = parseInt(groupId, 10);
      const numericMemberId = parseInt(memberId, 10);

      // Use groupService to remove member with business validation
      const updatedGroup = await groupService.removeMember(numericGroupId, numericMemberId);

      // Update local state
      const groupIndex = localGroups.findIndex((g) => String(g.id) === groupId);
      if (groupIndex !== -1) {
        const updatedGroups = [...localGroups];
        updatedGroups[groupIndex] = updatedGroup;
        setLocalGroups(updatedGroups);
      }

      showSuccess("Member removed successfully");
    } catch (error) {
      console.error("Failed to remove member:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to remove member. Please try again."
      );
      throw error;
    }
  };

  /**
   * Handle delete group
   */
  const handleDeleteGroup = async (groupId: string) => {
    try {
      const { groupService } = await import("@/src/services/groupService");
      const numericGroupId = parseInt(groupId, 10);

      // Use groupService to delete group with business validation
      await groupService.deleteGroup(numericGroupId);

      // Update local state
      setLocalGroups(localGroups.filter((g) => String(g.id) !== groupId));
      setSelectedGroupId(null);
      showSuccess("Group deleted successfully");
    } catch (error) {
      console.error("Failed to delete group:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to delete group. Please try again."
      );
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Groups</h1>
          <p className="text-[0.875rem] opacity-60">
            Create and manage groups for project applications
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary"
        >
          <Plus size={16} className="mr-2" />
          Create Group
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-[0.875rem] opacity-60">Loading groups...</p>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {!loading && localGroups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localGroups.map((group, index) => (
            <GroupCard
              key={group.id}
              group={group}
              users={users}
              currentUserId={user?.id ? String(user.id) : ""}
              onInvite={handleInviteMember}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && localGroups.length === 0 && (
        <GroupsEmptyState onCreateGroup={() => setIsCreateModalOpen(true)} />
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        open={isCreateModalOpen}
        formData={formData}
        errors={errors}
        availableMembers={availableMembers}
        usersMap={usersMap}
        currentUserId={user?.id ? String(user.id) : undefined}
        onClose={() => setIsCreateModalOpen(false)}
        onChange={(field, value) => setFormData({ ...formData, [field]: value })}
        onMembersChange={updateMembers}
        onClearError={clearError}
        onSubmit={handleCreate}
      />

      {/* Group Details Modal */}
      <GroupDetailsModal
        open={selectedGroup !== null && !isInviteModalOpen}
        onClose={() => setSelectedGroupId(null)}
        group={selectedGroup || null}
        users={users}
        currentUserId={user?.id ? String(user.id) : ""}
        onDeleteGroup={handleDeleteGroup}
        onRemoveMember={handleRemoveMember}
        onInviteMembers={handleInviteMember}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        open={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          // Keep selectedGroupId so we can reopen details modal if needed
          // Only clear if user explicitly closes from card
        }}
        group={inviteGroup || null}
        availableMembers={availableMembers}
        usersMap={usersMap}
        currentUserId={user?.id ? String(user.id) : undefined}
        onInvite={handleInviteMembers}
      />
    </div>
  );
}

