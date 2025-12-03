/**
 * Offer Confirmation Dialogs
 */
"use client";

import React from "react";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";

export interface Props {
  showAcceptConfirm: boolean;
  showDeclineConfirm: boolean;
  selectedApplication: ApplicationI | null;
  projects: Record<string, ProjectI>;
  onCloseAccept: () => void;
  onCloseDecline: () => void;
  onConfirmAccept: () => void;
  onConfirmDecline: () => void;
}

/**
 * Confirmation dialogs for accepting/declining offers
 */
const OfferConfirmations = ({
  showAcceptConfirm,
  showDeclineConfirm,
  selectedApplication,
  projects,
  onCloseAccept,
  onCloseDecline,
  onConfirmAccept,
  onConfirmDecline,
}: Props) => {
  return (
    <>
      <ConfirmationDialog
        open={showAcceptConfirm}
        onClose={onCloseAccept}
        onConfirm={onConfirmAccept}
        title="Accept Offer"
        message={
          selectedApplication
            ? `Are you sure you want to accept this offer for "${
                projects[selectedApplication.projectId]?.title ||
                selectedApplication.projectId
              }"? This will lock you into the project.`
            : ""
        }
        type="success"
        confirmText="Accept Offer"
      />

      <ConfirmationDialog
        open={showDeclineConfirm}
        onClose={onCloseDecline}
        onConfirm={onConfirmDecline}
        title="Decline Offer"
        message={
          selectedApplication
            ? `Are you sure you want to decline this offer for "${
                projects[selectedApplication.projectId]?.title ||
                selectedApplication.projectId
              }"?`
            : ""
        }
        type="warning"
        confirmText="Decline"
      />
    </>
  );
};

export default OfferConfirmations;









