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

  const { groups, users, loading } = useStudentGroupsData(user?.id || null);
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
  } = useGroupCreation(isCreateModalOpen, user?.id);

  useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

  const handleCreate = () => {
    if (!user) return;
    handleCreateGroup(user.id, user.courseId, (newGroup) => {
      setLocalGroups([...localGroups, newGroup]);
      setIsCreateModalOpen(false);
    });
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
      // Find group and update memberIds
      const groupIndex = localGroups.findIndex((g) => String(g.id) === groupId);
      if (groupIndex === -1) {
        throw new Error("Group not found");
      }

      const updatedGroups = [...localGroups];
      updatedGroups[groupIndex] = {
        ...updatedGroups[groupIndex],
        memberIds: [...updatedGroups[groupIndex].memberIds, ...memberIds],
      };

      setLocalGroups(updatedGroups);
      showSuccess(
        `Successfully invited ${memberIds.length} member${memberIds.length !== 1 ? "s" : ""}`
      );
    } catch (error) {
      console.error("Failed to invite members:", error);
      showError("Failed to invite members. Please try again.");
      throw error;
    }
  };

  /**
   * Handle remove member from group
   */
  const handleRemoveMember = async (groupId: string, memberId: string) => {
    try {
      const groupIndex = localGroups.findIndex((g) => String(g.id) === groupId);
      if (groupIndex === -1) {
        throw new Error("Group not found");
      }

      const updatedGroups = [...localGroups];
      updatedGroups[groupIndex] = {
        ...updatedGroups[groupIndex],
        memberIds: updatedGroups[groupIndex].memberIds.filter(
          (id) => id !== memberId
        ),
      };

      setLocalGroups(updatedGroups);
      showSuccess("Member removed successfully");
    } catch (error) {
      console.error("Failed to remove member:", error);
      showError("Failed to remove member. Please try again.");
      throw error;
    }
  };

  /**
   * Handle delete group
   */
  const handleDeleteGroup = async (groupId: string) => {
    try {
      setLocalGroups(localGroups.filter((g) => String(g.id) !== groupId));
      setSelectedGroupId(null);
      showSuccess("Group deleted successfully");
    } catch (error) {
      console.error("Failed to delete group:", error);
      showError("Failed to delete group. Please try again.");
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
              currentUserId={user?.id || ""}
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
        currentUserId={user?.id}
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
        group={selectedGroup}
        users={users}
        currentUserId={user?.id || ""}
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
        group={inviteGroup}
        availableMembers={availableMembers}
        usersMap={usersMap}
        currentUserId={user?.id}
        onInvite={handleInviteMembers}
      />
    </div>
  );
}

