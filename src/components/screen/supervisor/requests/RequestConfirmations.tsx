/**
 * Request Confirmation Dialogs Component
 */
"use client";

import React from "react";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";

export interface Props {
  showApproveConfirm: boolean;
  showDenyConfirm: boolean;
  onCloseApprove: () => void;
  onCloseDeny: () => void;
  onConfirmApprove: () => void;
  onConfirmDeny: () => void;
}

/**
 * Confirmation dialogs for approving/denying requests
 */
const RequestConfirmations = ({
  showApproveConfirm,
  showDenyConfirm,
  onCloseApprove,
  onCloseDeny,
  onConfirmApprove,
  onConfirmDeny,
}: Props) => {
  return (
    <>
      <ConfirmationDialog
        open={showApproveConfirm}
        onClose={onCloseApprove}
        onConfirm={onConfirmApprove}
        title="Approve Supervisor Request"
        message="Are you sure you want to approve this supervisor request? You will be assigned to this project."
        type="info"
        confirmText="Approve"
      />
      <ConfirmationDialog
        open={showDenyConfirm}
        onClose={onCloseDeny}
        onConfirm={onConfirmDeny}
        title="Deny Supervisor Request"
        message="Are you sure you want to deny this supervisor request? The student will be notified and can request another supervisor."
        type="warning"
        confirmText="Deny"
      />
    </>
  );
};

export default RequestConfirmations;









