/**
 * Group Card Component
 * Enhanced display with overlapping avatars, member information, and improved layout
 */
"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Button from "@/src/components/core/Button";
import { GroupI } from "@/src/models/group";
import { UserI } from "@/src/models/user";
import { UserPlus, Users, Calendar, Crown } from "lucide-react";
import { getInitials, hasAvatar } from "@/src/utils/avatarUtils";
import { formatDateShort } from "@/src/utils/dateFormatters";

export interface Props {
  group: GroupI;
  users: Record<string, UserI>;
  currentUserId: string;
  onInvite: (groupId: string) => void;
  onViewDetails: (groupId: string) => void;
}

/**
 * Display a single group card with enhanced UI
 * Features overlapping avatars, member information, and capacity indicators
 */
const GroupCard = ({ group, users, currentUserId, onInvite, onViewDetails }: Props) => {
  const isLeader = group.leaderId === currentUserId;
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  /**
   * Get group members as UserI objects, sorted with leader first
   */
  const groupMembers = useMemo(() => {
    const members = group.memberIds
      .map((id) => users[id])
      .filter((user): user is UserI => user !== undefined);

    // Sort: leader first, then others
    return members.sort((a, b) => {
      if (a.id === group.leaderId) return -1;
      if (b.id === group.leaderId) return 1;
      return 0;
    });
  }, [group.memberIds, group.leaderId, users]);

  /**
   * Calculate capacity percentage for progress indicator
   */
  const capacityPercentage = useMemo(() => {
    return Math.round((group.memberIds.length / group.capacity) * 100);
  }, [group.memberIds.length, group.capacity]);

  /**
   * Check if group is full
   */
  const isFull = group.memberIds.length >= group.capacity;

  /**
   * Handle image load error
   */
  const handleImageError = (userId: string) => {
    setFailedImages((prev) => new Set(prev).add(userId));
  };

  /**
   * Render avatar with fallback to initials
   * Uses overlapping style like Project.tsx
   */
  const renderAvatar = (member: UserI, index: number) => {
    const avatarUrl = member.profile?.avatar;
    const hasImage = hasAvatar(avatarUrl) && !failedImages.has(member.id);
    const initials = getInitials(member.name);
    const isMemberLeader = member.id === group.leaderId;

    return (
      <motion.div
        key={member.id}
        className={`relative ${index > 0 ? "-ml-3" : ""}`}
        style={{
          zIndex: groupMembers.length - index,
        }}
        whileHover={{ scale: 1.1, zIndex: 100 }}
        transition={{ type: "spring", stiffness: 400 }}
        title={`${member.name}${isMemberLeader ? " (Leader)" : ""}`}
      >
        {hasImage ? (
          <img
            src={avatarUrl}
            alt={member.name}
            className={`h-12 w-12 border-2 rounded-full object-cover ${isMemberLeader ? "border-primary" : "border-pale"
              }`}
            onError={() => handleImageError(member.id)}
          />
        ) : (
          <div
            className={`h-12 w-12 border-2 rounded-full flex items-center justify-center bg-pale-primary ${isMemberLeader ? "border-primary" : "border-pale"
              }`}
          >
            <span className="text-primary font-semibold text-sm">
              {initials}
            </span>
          </div>
        )}
        {/* Leader badge */}
        {isMemberLeader && (
          <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
            <Crown size={10} />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200"
    >
      {/* Header with group name and leader badge */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[1rem] font-[600] flex-1">{group.name}</h3>
        {isLeader && (
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-primary text-white rounded-full text-xs font-medium flex items-center gap-1"
          >
            <Crown size={12} />
            Leader
          </motion.span>
        )}
      </div>

      {/* Member avatars with overlapping style */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={14} className="opacity-60" />
            <p className="text-[0.8125rem] opacity-60">
              {group.memberIds.length} of {group.capacity} members
            </p>
          </div>
          {isFull && (
            <span className="px-2 py-1 bg-pale-primary text-primary rounded-full text-[0.75rem] font-medium">
              Full
            </span>
          )}
        </div>

        {/* Overlapping avatars */}
        <div className="flex items-center gap-2 mb-3">
          {groupMembers.map((member, index) => renderAvatar(member, index))}
          {groupMembers.length === 0 && (
            <p className="text-[0.8125rem] opacity-50">No members yet</p>
          )}
        </div>

        {/* Capacity progress bar */}
        <div className="w-full bg-very-pale rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${capacityPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-2 rounded-full bg-primary`}
          />
        </div>
      </div>

      {/* Member names list */}
      {groupMembers.length > 0 && (
        <div className="mb-4 pb-4 border-b border-pale">
          <div className="flex flex-wrap gap-2">
            {groupMembers.map((member) => (
              <span
                key={member.id}
                className={`text-[0.75rem] px-2 py-1 rounded-full ${member.id === group.leaderId
                  ? "bg-pale-primary text-primary font-medium"
                  : "bg-pale opacity-70"
                  }`}
              >
                {member.name}
                {member.id === group.leaderId && (
                  <Crown size={10} className="inline ml-1" />
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer with date and actions */}
      <div className="space-y-3">
        {/* Created date */}
        <div className="flex items-center gap-2 text-[0.75rem] opacity-50">
          <Calendar size={12} />
          <span>Created {formatDateShort(group.createdAt)}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {isLeader && !isFull && (
            <Button
              onClick={() => onInvite(String(group.id))}
              className="bg-pale text-primary flex-1 text-[0.875rem] py-2.5"
            >
              <UserPlus size={14} className="mr-1" />
              Invite
            </Button>
          )}
          <Button
            onClick={() => onViewDetails(String(group.id))}
            className="bg-primary flex-1 text-[0.875rem] py-2.5"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupCard;




