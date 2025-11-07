/**
 * Issue Offer Modal
 */
"use client";

import React from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import Input from "@/src/components/core/Input";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { Send } from "lucide-react";

export interface Props {
  open: boolean;
  application: ApplicationI | null;
  projects: Record<string, ProjectI>;
  offerExpiry: string;
  errors: Record<string, string>;
  onClose: () => void;
  onExpiryChange: (value: string) => void;
  onSubmit: () => void;
}

/**
 * Modal for issuing offers to applications
 */
const IssueOfferModal = ({
  open,
  application,
  projects,
  offerExpiry,
  errors,
  onClose,
  onExpiryChange,
  onSubmit,
}: Props) => {
  return (
    <Modal
      title="Issue Offer"
      open={open}
      handleClose={onClose}
      actions={[
        <Button key="cancel" onClick={onClose} className="bg-pale text-primary">
          Cancel
        </Button>,
        <Button key="send" onClick={onSubmit} className="bg-primary">
          <Send size={16} className="mr-2" />
          Send Offer
        </Button>,
      ]}
    >
      {application && (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-secondary mb-1">Project</p>
            <p className="font-semibold">
              {projects[application.projectId]?.title || application.projectId}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary mb-1">Applicant</p>
            <p className="font-semibold capitalize">
              {application.applicantType.toLowerCase()}
            </p>
          </div>
          <Input
            title="Offer Expiry Date *"
            type="date"
            value={offerExpiry}
            onChange={(e) => onExpiryChange(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
            error={errors.expiry}
          />
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-warning-dark">
              The applicant will receive an email notification with this offer.
              They must accept before the expiry date.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default IssueOfferModal;






