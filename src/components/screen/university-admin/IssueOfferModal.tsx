/**
 * Assign Group Modal - Confirms assignment of group to project
 */
"use client";

import React from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { Check } from "lucide-react";

export interface Props {
  open: boolean;
  application: ApplicationI | null;
  projects: Record<string, ProjectI>;
  onClose: () => void;
  onSubmit: () => void;
}

/**
 * Modal for assigning groups to projects (immediate assignment, no offer flow)
 */
const IssueOfferModal = ({
  open,
  application,
  projects,
  onClose,
  onSubmit,
}: Props) => {
  return (
    <Modal
      title="Assign Group to Project"
      open={open}
      handleClose={onClose}
      actions={[
        <Button key="cancel" onClick={onClose} className="bg-pale text-primary">
          Cancel
        </Button>,
        <Button key="assign" onClick={onSubmit} className="bg-primary">
          <Check size={16} className="mr-2" />
          Assign
        </Button>,
      ]}
    >
      {application && (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-secondary mb-1">Project</p>
            <p className="font-semibold">
              {projects[application.projectId.toString()]?.title || application.projectId}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary mb-1">Applicant</p>
            <p className="font-semibold capitalize">
              {application.applicantType.toLowerCase()}
            </p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-primary">
              This group will be immediately assigned to the project. The assignment cannot be undone.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default IssueOfferModal;






