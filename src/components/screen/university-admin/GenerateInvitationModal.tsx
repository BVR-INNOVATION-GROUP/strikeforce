/**
 * Generate Invitation Modal - form for creating new invitations
 */
"use client";

import React, { useState } from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import { InvitationI, InvitationRole } from "@/src/models/invitation";
import InvitationFormFields from "./InvitationFormFields";
import InvitationSuccessView from "./InvitationSuccessView";
import { validateInvitationForm, ValidationErrors } from "@/src/utils/invitationValidation";

export interface Props {
  open: boolean;
  onClose: () => void;
  onGenerate: (
    email: string,
    role: InvitationRole,
    expiresInDays: number
  ) => Promise<InvitationI>;
  generating: boolean;
}

/**
 * Modal for generating invitation links
 */
const GenerateInvitationModal = ({
  open,
  onClose,
  onGenerate,
  generating,
}: Props) => {
  const [formData, setFormData] = useState({
    email: "",
    role: "student" as InvitationRole,
    expiresInDays: "7",
  });
  const [generatedInvitation, setGeneratedInvitation] =
    useState<InvitationI | null>(null);
  const [invitationLink, setInvitationLink] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = (): boolean => {
    const validationErrors = validateInvitationForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleGenerate = async () => {
    if (!validate()) return;

    try {
      const days = parseInt(formData.expiresInDays);
      const invitation = await onGenerate(formData.email, formData.role, days);

      // Generate link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const link = `${baseUrl}/auth/invite?token=${invitation.token}`;

      setGeneratedInvitation(invitation);
      setInvitationLink(link);
    } catch (error) {
      console.error("Failed to generate invitation:", error);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ email: "", role: "student", expiresInDays: "7" });
    setGeneratedInvitation(null);
    setInvitationLink("");
    setErrors({});
  };

  return (
    <Modal
      title={generatedInvitation ? "Invitation Generated" : "Generate Invitation"}
      open={open}
      handleClose={handleClose}
      actions={
        generatedInvitation
          ? [
              <Button key="close" onClick={handleClose} className="bg-primary">
                Done
              </Button>,
            ]
          : [
              <Button
                key="cancel"
                onClick={handleClose}
                className="bg-pale text-primary"
              >
                Cancel
              </Button>,
              <Button
                key="generate"
                onClick={handleGenerate}
                className="bg-primary"
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate Invitation"}
              </Button>,
            ]
      }
    >
      {generatedInvitation ? (
        <InvitationSuccessView
          invitation={generatedInvitation}
          invitationLink={invitationLink}
        />
      ) : (
        <InvitationFormFields
          email={formData.email}
          role={formData.role}
          expiresInDays={formData.expiresInDays}
          errors={errors}
          onEmailChange={(email) => {
            setFormData({ ...formData, email });
            clearError("email");
          }}
          onRoleChange={(role) => {
            setFormData({ ...formData, role });
            clearError("role");
          }}
          onExpiresInDaysChange={(days) => {
            setFormData({ ...formData, expiresInDays: days });
            clearError("expiresInDays");
          }}
          onClearError={clearError}
        />
      )}
    </Modal>
  );
};

export default GenerateInvitationModal;

