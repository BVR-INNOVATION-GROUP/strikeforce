/**
 * Workspace Modals Component
 */
"use client";

import React from "react";
import MilestoneSubmissionForm from "@/src/components/screen/student/MilestoneSubmissionForm";
import DisputeCreationForm from "@/src/components/screen/dispute/DisputeCreationForm";
import { MilestoneI } from "@/src/models/milestone";
import { submissionService } from "@/src/services/submissionService";
import { disputeService } from "@/src/services/disputeService";

export interface Props {
  selectedMilestone: MilestoneI | null;
  isSubmissionModalOpen: boolean;
  isDisputeModalOpen: boolean;
  onCloseSubmission: () => void;
  onCloseDispute: () => void;
  onSubmissionSuccess: () => Promise<void>;
  onDisputeSuccess: () => Promise<void>;
}

/**
 * All modals for workspace page
 */
const WorkspaceModals = ({
  selectedMilestone,
  isSubmissionModalOpen,
  isDisputeModalOpen,
  onCloseSubmission,
  onCloseDispute,
  onSubmissionSuccess,
  onDisputeSuccess,
}: Props) => {
  if (!selectedMilestone) {
    return null;
  }

  return (
    <>
      <MilestoneSubmissionForm
        open={isSubmissionModalOpen}
        milestone={selectedMilestone}
        onClose={onCloseSubmission}
        onSubmit={async (submissionData) => {
          await submissionService.submitMilestone(submissionData);
          await onSubmissionSuccess();
        }}
      />
      <DisputeCreationForm
        open={isDisputeModalOpen}
        subjectType="MILESTONE"
        subjectId={selectedMilestone.id}
        onClose={onCloseDispute}
        onSubmit={async (disputeData) => {
          await disputeService.createDispute(disputeData);
          await onDisputeSuccess();
        }}
      />
    </>
  );
};

export default WorkspaceModals;





