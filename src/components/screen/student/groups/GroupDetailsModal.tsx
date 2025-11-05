/**
 * Group Details Modal - Side panel for viewing and managing group details
 * Slides in from the right with management actions
 */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Calendar, Crown, Trash2, UserMinus, UserPlus } from "lucide-react";
import IconButton from "@/src/components/core/IconButton";
import Button from "@/src/components/core/Button";
import { GroupI } from "@/src/models/group";
import { UserI } from "@/src/models/user";
import { getInitials, hasAvatar } from "@/src/utils/avatarUtils";
import { formatDateShort } from "@/src/utils/dateFormatters";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";

export interface Props {
    open: boolean;
    onClose: () => void;
    group: GroupI | null;
    users: Record<string, UserI>;
    currentUserId: string;
    onDeleteGroup: (groupId: string) => Promise<void>;
    onRemoveMember: (groupId: string, memberId: string) => Promise<void>;
    onInviteMembers: (groupId: string) => void;
}

/**
 * Side modal for group details and management
 * Features member management, delete group, and invite actions
 */
const GroupDetailsModal = ({
    open,
    onClose,
    group,
    users,
    currentUserId,
    onDeleteGroup,
    onRemoveMember,
    onInviteMembers,
}: Props) => {
    const [mounted, setMounted] = useState(false);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    /**
     * Get group members sorted with leader first
     */
    const groupMembers = useMemo(() => {
        if (!group) return [];
        const members = group.memberIds
            .map((id) => users[id])
            .filter((user): user is UserI => user !== undefined);

        return members.sort((a, b) => {
            if (a.id === group.leaderId) return -1;
            if (b.id === group.leaderId) return 1;
            return 0;
        });
    }, [group, users]);

    /**
     * Check if current user is leader
     */
    const isLeader = group?.leaderId === currentUserId;

    /**
     * Check if group is full
     */
    const isFull = group ? group.memberIds.length >= group.capacity : false;

    /**
     * Handle image load error
     */
    const handleImageError = (userId: string) => {
        setFailedImages((prev) => new Set(prev).add(userId));
    };

    /**
     * Handle delete group
     */
    const handleDelete = async () => {
        if (!group) return;
        setDeleting(true);
        try {
            await onDeleteGroup(String(group.id));
            setShowDeleteConfirm(false);
            onClose();
        } catch (error) {
            console.error("Failed to delete group:", error);
        } finally {
            setDeleting(false);
        }
    };

    /**
     * Handle remove member
     */
    const handleRemoveMember = async (memberId: string) => {
        if (!group) return;
        setRemovingMemberId(memberId);
        try {
            await onRemoveMember(String(group.id), memberId);
        } catch (error) {
            console.error("Failed to remove member:", error);
        } finally {
            setRemovingMemberId(null);
        }
    };

    /**
     * Render avatar with fallback
     */
    const renderAvatar = (member: UserI, index: number) => {
        const avatarUrl = member.profile?.avatar;
        const hasImage = hasAvatar(avatarUrl) && !failedImages.has(member.id);
        const initials = getInitials(member.name);
        const isMemberLeader = member.id === group?.leaderId;

        return (
            <div
                key={member.id}
                className={`relative ${index > 0 ? "-ml-3" : ""}`}
                style={{
                    zIndex: groupMembers.length - index,
                }}
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
                {isMemberLeader && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                        <Crown size={10} />
                    </div>
                )}
            </div>
        );
    };

    if (!mounted || !group) return null;

    const modalContent = (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                        style={{ zIndex: 99998 }}
                    />

                    {/* Right-side modal */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-[65%] min-w-[500px] max-w-[800px] bg-paper shadow-custom flex flex-col"
                        style={{ zIndex: 99999 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-custom flex-shrink-0">
                            <div className="flex-1">
                                <h2 className="text-[1.125rem] font-[600] mb-1">{group.name}</h2>
                                <div className="flex items-center gap-4 text-[0.8125rem] opacity-60">
                                    <div className="flex items-center gap-1">
                                        <Users size={14} />
                                        <span>
                                            {group.memberIds.length} of {group.capacity} members
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>Created {formatDateShort(group.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <IconButton
                                onClick={onClose}
                                icon={<X size={20} />}
                                className="hover-bg-pale"
                            />
                        </div>

                        {/* Content - scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                            {/* Member Avatars */}
                            <div>
                                <h3 className="text-[0.875rem] font-[600] mb-3">Members</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    {groupMembers.map((member, index) => renderAvatar(member, index))}
                                </div>

                                {/* Capacity Progress */}
                                <div className="w-full bg-very-pale rounded-full h-2 mb-4">
                                    <div
                                        className={`h-2 rounded-full bg-primary`}
                                        style={{
                                            width: `${Math.round(
                                                (group.memberIds.length / group.capacity) * 100
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Member List */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[0.875rem] font-[600]">Member List</h3>
                                    {isLeader && !isFull && (
                                        <Button
                                            onClick={() => {
                                                // Open invite modal - this will automatically close details modal
                                                // because GroupDetailsModal's open condition includes !isInviteModalOpen
                                                onInviteMembers(String(group.id));
                                            }}
                                            className="bg-pale text-primary text-[0.8125rem] py-1.5 px-3"
                                        >
                                            <UserPlus size={14} className="mr-1" />
                                            Invite
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {groupMembers.map((member) => {
                                        const isMemberLeader = member.id === group.leaderId;
                                        const canRemove =
                                            isLeader &&
                                            !isMemberLeader &&
                                            member.id !== currentUserId;

                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-3 bg-pale rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {renderAvatar(member, 0)}
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[0.875rem] font-medium">
                                                                {member.name}
                                                            </span>
                                                            {isMemberLeader && (
                                                                <span className="px-2 py-0.5 bg-primary text-white rounded-full text-[0.75rem] flex items-center gap-1">
                                                                    <Crown size={10} />
                                                                    Leader
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[0.75rem] opacity-60">
                                                            {member.email}
                                                        </span>
                                                    </div>
                                                </div>
                                                {canRemove && (
                                                    <Button
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        className="bg-pale text-primary text-[0.8125rem] py-1.5 px-3"
                                                        disabled={removingMemberId === member.id}
                                                    >
                                                        <UserMinus size={14} className="mr-1" />
                                                        {removingMemberId === member.id
                                                            ? "Removing..."
                                                            : "Remove"}
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Management Actions - Leader Only */}
                            {isLeader && (
                                <div className="pt-6 border-t border-custom">
                                    <h3 className="text-[0.875rem] font-[600] mb-4 text-primary">
                                        Management Actions
                                    </h3>
                                    <div className="space-y-3">
                                        <Button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="bg-pale text-primary w-full text-[0.875rem] py-3"
                                        >
                                            <Trash2 size={16} className="mr-2" />
                                            Delete Group
                                        </Button>
                                    </div>
                                    <p className="text-[0.75rem] opacity-60 mt-3">
                                        Deleting a group will permanently remove it and all associated
                                        data. This action cannot be undone.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {createPortal(modalContent, document.body)}
            <ConfirmationDialog
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Group"
                message={
                    <div className="space-y-2">
                        <p>
                            Are you sure you want to delete "{group?.name}"? This action
                            cannot be undone.
                        </p>
                        <p className="text-sm opacity-75">
                            All group data and member associations will be permanently removed.
                        </p>
                    </div>
                }
                type="danger"
                confirmText="Delete Group"
                cancelText="Cancel"
                loading={deleting}
            />
        </>
    );
};

export default GroupDetailsModal;

