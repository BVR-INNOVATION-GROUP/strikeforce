/**
 * Dispute Details Modal - Side panel for viewing dispute details with user avatars
 */
"use client";

import React, { useState } from "react";
import SideModal from "@/src/components/base/SideModal";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { DisputeI } from "@/src/models/dispute";
import { UserI } from "@/src/models/user";
import { AlertCircle, Calendar, FileText } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";
import { getInitials, hasAvatar } from "@/src/utils/avatarUtils";

export interface Props {
  open: boolean;
  onClose: () => void;
  dispute: DisputeI | null;
  raisedByUser?: UserI;
  assignedToUser?: UserI;
  onReview?: (dispute: DisputeI) => void;
}

/**
 * Side modal for dispute details with user avatars
 */
const DisputeDetailsModal = ({
  open,
  onClose,
  dispute,
  raisedByUser,
  assignedToUser,
  onReview,
}: Props) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  if (!dispute) return null;

  const handleImageError = (userId: string) => {
    setFailedImages((prev) => new Set(prev).add(userId));
  };

  const renderUserAvatar = (user: UserI | undefined, label: string) => {
    if (!user) {
      return (
        <div className="p-4 bg-pale rounded-lg">
          <p className="text-[0.875rem] font-medium mb-2">{label}</p>
          <p className="text-[0.8125rem] opacity-60">Not available</p>
        </div>
      );
    }

    const avatarUrl = user.profile?.avatar;
    const hasImage = hasAvatar(avatarUrl) && !failedImages.has(user.id);
    const initials = getInitials(user.name);

    return (
      <div className="p-4 bg-pale rounded-lg">
        <p className="text-[0.875rem] font-medium mb-3">{label}</p>
        <div className="flex items-center gap-3">
          {hasImage ? (
            <img
              src={avatarUrl}
              alt={user.name}
              className="h-12 w-12 border-2 border-pale rounded-full object-cover"
              onError={() => handleImageError(user.id)}
            />
          ) : (
            <div className="h-12 w-12 border-2 border-pale rounded-full flex items-center justify-center bg-pale-primary">
              <span className="text-primary font-semibold text-sm">
                {initials}
              </span>
            </div>
          )}
          <div className="flex-1">
            <p className="text-[0.875rem] font-medium">{user.name}</p>
            <p className="text-[0.8125rem] opacity-60">{user.email}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Dispute Details"
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-pale-primary rounded-lg">
            <AlertCircle size={32} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[1.125rem] font-[600] mb-1 capitalize">
              {dispute.subjectType.toLowerCase()}
            </h3>
            <div className="flex items-center gap-2">
              <StatusIndicator status={dispute.status} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Reason</p>
            </div>
            <p className="text-[0.875rem] opacity-60">{dispute.reason}</p>
          </div>

          {dispute.description && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Description</p>
              </div>
              <p className="text-[0.875rem] opacity-60">{dispute.description}</p>
            </div>
          )}

          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Level</p>
            </div>
            <p className="text-[0.875rem] opacity-60 capitalize">
              {dispute.level.replace("_", " ").toLowerCase()}
            </p>
          </div>

          {dispute.evidence && dispute.evidence.length > 0 && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Evidence</p>
              </div>
              <p className="text-[0.875rem] opacity-60">
                {dispute.evidence.length} file(s) attached
              </p>
            </div>
          )}

          {/* User Information with Avatars */}
          {renderUserAvatar(raisedByUser, "Raised By")}
          {assignedToUser && renderUserAvatar(assignedToUser, "Assigned To")}

          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Created Date</p>
            </div>
            <p className="text-[0.875rem] opacity-60">
              {formatDateShort(dispute.createdAt)}
            </p>
          </div>

          {dispute.resolvedAt && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Resolved Date</p>
              </div>
              <p className="text-[0.875rem] opacity-60">
                {formatDateShort(dispute.resolvedAt)}
              </p>
            </div>
          )}

          {dispute.resolution && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Resolution</p>
              </div>
              <p className="text-[0.875rem] opacity-60">{dispute.resolution}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {onReview && (
          <div className="pt-4 border-t border-custom">
            <Button
              onClick={() => {
                onReview(dispute);
                onClose();
              }}
              className="bg-primary w-full"
            >
              Review Dispute
            </Button>
          </div>
        )}
      </div>
    </SideModal>
  );
};

export default DisputeDetailsModal;


