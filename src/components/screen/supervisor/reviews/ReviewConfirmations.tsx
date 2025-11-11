/**
 * Review Confirmation Dialogs Component
 */
"use client";

import React from "react";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";

export interface Props {
  showApproveConfirm: boolean;
  showRequestChangesConfirm: boolean;
  onCloseApprove: () => void;
  onCloseRequestChanges: () => void;
  onConfirmApprove: () => Promise<void>;
  onConfirmRequestChanges: () => Promise<void>;
}

/**
 * Confirmation dialogs for milestone review actions
 */
const ReviewConfirmations = ({
  showApproveConfirm,
  showRequestChangesConfirm,
  onCloseApprove,
  onCloseRequestChanges,
  onConfirmApprove,
  onConfirmRequestChanges,
}: Props) => {
  return (
    <>
      <ConfirmationDialog
        open={showApproveConfirm}
        onClose={onCloseApprove}
        onConfirm={onConfirmApprove}
        title="Approve Milestone for Partner"
        message="Are you sure you want to approve this milestone? It will be sent to the partner for final review and potential escrow release."
        type="info"
        confirmText="Approve"
      />

      <ConfirmationDialog
        open={showRequestChangesConfirm}
        onClose={onCloseRequestChanges}
        onConfirm={onConfirmRequestChanges}
        title="Request Changes"
        message="You are about to request changes on this milestone. Please ensure your review notes are detailed and clear. Continue?"
        type="warning"
        confirmText="Request Changes"
      />
    </>
  );
};

export default ReviewConfirmations;








