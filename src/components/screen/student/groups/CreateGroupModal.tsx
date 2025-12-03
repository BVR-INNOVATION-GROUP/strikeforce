/**
 * Create Group Modal Component
 * Enhanced with member search and selection
 */
"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Modal from "@/src/components/base/Modal";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import MultiSelect, { OptionI } from "@/src/components/base/MultiSelect";
import { GroupFormData, ValidationErrors } from "@/src/utils/groupValidation";
import { UserI } from "@/src/models/user";
import { getInitials, hasAvatar } from "@/src/utils/avatarUtils";

export interface Props {
  open: boolean;
  formData: GroupFormData;
  errors: ValidationErrors;
  availableMembers: OptionI[];
  usersMap: Record<string, UserI>;
  loadingMembers?: boolean;
  currentUserId?: string | null;
  onClose: () => void;
  onChange: (field: keyof GroupFormData, value: string | number) => void;
  onMembersChange: (memberIds: string[]) => void;
  onClearError: (field: string) => void;
  onSearchMembers?: (query: string) => void;
  onSubmit: () => void;
}

/**
 * Modal for creating a new group
 * Features member search and selection with avatar display
 */
const CreateGroupModal = ({
  open,
  formData,
  errors,
  availableMembers,
  usersMap,
  loadingMembers = false,
  currentUserId,
  onClose,
  onChange,
  onMembersChange,
  onClearError,
  onSearchMembers,
  onSubmit,
}: Props) => {
  /**
   * Convert selected member IDs to OptionI format for MultiSelect
   */
  const selectedMemberOptions = useMemo(() => {
    return formData.memberIds
      .map((id) => {
        const user = usersMap[id];
        if (!user) return null;
        return {
          label: user.name,
          value: user.id,
        };
      })
      .filter((opt): opt is OptionI => opt !== null);
  }, [formData.memberIds, usersMap]);

  /**
   * Handle member selection from MultiSelect
   * Converts OptionI[] to string[] for form data
   */
  const handleMemberSelection = (options: OptionI[]) => {
    const memberIds = options.map((opt) => String(opt.value));
    onMembersChange(memberIds);
  };

  /**
   * Get selected members as UserI objects for avatar display
   */
  const selectedMembers = useMemo(() => {
    return formData.memberIds
      .map((id) => usersMap[id])
      .filter((user): user is UserI => user !== undefined);
  }, [formData.memberIds, usersMap]);

  /**
   * Get current user for display (leader)
   */
  const currentUser = currentUserId ? usersMap[currentUserId] : null;

  /**
   * Track failed image loads to show initials fallback
   * Uses Set to track which user IDs had image load failures
   */
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  /**
   * Handle image load error - add to failed images set
   */
  const handleImageError = (userId: string) => {
    setFailedImages((prev) => new Set(prev).add(userId));
  };

  /**
   * Render avatar with fallback to initials
   * Matches Project.tsx structure but adds initials fallback
   */
  const renderAvatar = (
    user: UserI,
    isLeader: boolean = false,
    index: number = 0
  ) => {
    const avatarUrl = user.profile?.avatar;
    const hasImage = hasAvatar(avatarUrl) && !failedImages.has(user.id);
    const initials = getInitials(user.name);

    return (
      <motion.div
        key={user.id}
        className={`relative ${
          index > 0 || (isLeader && index === 0) ? "-ml-3" : ""
        }`}
        style={{
          zIndex: isLeader ? 100 : 10 - index,
        }}
        whileHover={{ scale: 1.1, zIndex: 20 }}
        transition={{ type: "spring", stiffness: 400 }}
        title={isLeader ? `${user.name} (You - Leader)` : user.name}
      >
        {hasImage ? (
          <img
            src={avatarUrl}
            alt={user.name}
            className={`h-12 w-12 border-2 rounded-full object-cover ${
              isLeader ? "border-primary" : "border-pale"
            }`}
            onError={() => handleImageError(user.id)}
          />
        ) : (
          <div
            className={`h-12 w-12 border-2 rounded-full flex items-center justify-center bg-pale-primary ${
              isLeader ? "border-primary" : "border-pale"
            }`}
          >
            <span className={`text-primary font-semibold text-sm`}>
              {initials}
            </span>
          </div>
        )}
        {/* Leader badge */}
        {isLeader && (
          <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
            L
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Modal
      title="Create New Group"
      open={open}
      handleClose={onClose}
      actions={[
        <Button key="cancel" onClick={onClose} className="bg-pale text-primary">
          Cancel
        </Button>,
        <Button key="create" onClick={onSubmit} className="bg-primary">
          Create Group
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <Input
          title="Group Name *"
          value={formData.name}
          onChange={(e) => {
            onChange("name", e.target.value);
            onClearError("name");
          }}
          placeholder="Enter group name"
          error={errors.name}
        />

        <Input
          title="Capacity *"
          type="number"
          value={formData.capacity.toString()}
          onChange={(e) => {
            onChange("capacity", parseInt(e.target.value) || 5);
            onClearError("capacity");
          }}
          placeholder="Maximum members"
          min="2"
          max="20"
          error={errors.capacity}
        />

        {/* Member Selection Section */}
        <div className="space-y-3">
          <div>
            <p className="mb-3 text-[12px]">Group Members</p>
            
            {/* Display selected members with avatars (benchmarked from Project.tsx) */}
            {/* Uses initials fallback when images fail to load */}
            {(selectedMembers.length > 0 || currentUser) && (
              <div className="my-3 flex items-center gap-2">
                {/* Current user (leader) - always shown first */}
                {currentUser && renderAvatar(currentUser, true, 0)}

                {/* Selected members - overlapping avatars like Project.tsx */}
                {selectedMembers.map((member, i) =>
                  renderAvatar(member, false, i + 1)
                )}
              </div>
            )}

            {/* Member search MultiSelect */}
            <MultiSelect
              title="Add Members *"
              options={availableMembers}
              value={selectedMemberOptions}
              onChange={handleMemberSelection}
              placeHolder="Search and select members..."
              error={errors.memberIds}
              onSearch={onSearchMembers}
              loading={loadingMembers}
            />

            {/* Helper text showing capacity */}
            {formData.capacity && (
              <p className="text-[11px] opacity-50 mt-2">
                {selectedMembers.length + 1} of {formData.capacity} members selected (including you as leader)
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateGroupModal;




