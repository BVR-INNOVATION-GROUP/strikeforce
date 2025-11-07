/**
 * Invite Member Modal Component
 * Allows group leader to invite members to their group
 */
"use client";

import React, { useMemo, useState } from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import MultiSelect, { OptionI } from "@/src/components/base/MultiSelect";
import { UserI } from "@/src/models/user";
import { GroupI } from "@/src/models/group";

export interface Props {
  open: boolean;
  onClose: () => void;
  group: GroupI | null;
  availableMembers: OptionI[];
  usersMap: Record<string, UserI>;
  currentUserId?: string | null;
  onInvite: (groupId: string, memberIds: string[]) => Promise<void>;
}

/**
 * Modal for inviting members to a group
 * Filters out already selected members and shows available students
 */
const InviteMemberModal = ({
  open,
  onClose,
  group,
  availableMembers,
  usersMap,
  currentUserId,
  onInvite,
}: Props) => {
  const [selectedMembers, setSelectedMembers] = useState<OptionI[]>([]);
  const [inviting, setInviting] = useState(false);

  /**
   * Filter available members to exclude current group members
   */
  const filteredMembers = useMemo(() => {
    if (!group) return availableMembers;
    return availableMembers.filter(
      (member) => !group.memberIds.includes(String(member.value))
    );
  }, [availableMembers, group]);

  /**
   * Handle member selection
   */
  const handleMemberSelection = (options: OptionI[]) => {
    // Validate capacity
    if (!group) return;
    const totalMembers = group.memberIds.length + options.length;
    if (totalMembers > group.capacity) {
      return; // Don't allow selection if it exceeds capacity
    }
    setSelectedMembers(options);
  };

  /**
   * Handle invite submission
   */
  const handleInvite = async () => {
    if (!group || selectedMembers.length === 0 || inviting) return;

    const memberIds = selectedMembers.map((m) => String(m.value));
    setInviting(true);
    try {
      await onInvite(group.id, memberIds);
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error("Failed to invite members:", error);
    } finally {
      setInviting(false);
    }
  };

  /**
   * Reset selection when modal closes
   */
  React.useEffect(() => {
    if (!open) {
      setSelectedMembers([]);
    }
  }, [open]);

  if (!group) return null;

  const remainingCapacity = group.capacity - group.memberIds.length;
  const canInviteMore = selectedMembers.length <= remainingCapacity;

  return (
    <Modal
      title={`Invite Members to ${group.name}`}
      open={open}
      handleClose={onClose}
      actions={[
        <Button key="cancel" onClick={onClose} className="bg-pale text-primary">
          Cancel
        </Button>,
        <Button
          key="invite"
          onClick={handleInvite}
          className="bg-primary"
          disabled={selectedMembers.length === 0 || !canInviteMore || inviting}
        >
          {inviting ? "Inviting..." : `Invite ${selectedMembers.length} Member${selectedMembers.length !== 1 ? "s" : ""}`}
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <div className="bg-pale-primary p-4 rounded-lg">
          <p className="text-[0.8125rem] opacity-80">
            <strong>{remainingCapacity}</strong> spot{remainingCapacity !== 1 ? "s" : ""} available
            in this group
          </p>
        </div>

        <MultiSelect
          title="Select Members to Invite"
          options={filteredMembers}
          value={selectedMembers}
          onChange={handleMemberSelection}
          placeHolder="Search and select members to invite..."
        />

        {selectedMembers.length > remainingCapacity && (
          <p className="text-[0.75rem] text-primary">
            You can only invite {remainingCapacity} more member
            {remainingCapacity !== 1 ? "s" : ""}. Please reduce your selection.
          </p>
        )}

        {selectedMembers.length > 0 && canInviteMore && (
          <div className="pt-2">
            <p className="text-[0.8125rem] opacity-60 mb-2">Selected members:</p>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((member) => {
                const user = usersMap[String(member.value)];
                return (
                  <span
                    key={member.value}
                    className="px-3 py-1 bg-pale-primary text-primary rounded-full text-[0.75rem]"
                  >
                    {user?.name || member.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default InviteMemberModal;



