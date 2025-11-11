/**
 * Invite Acceptance Form Component
 */
"use client";

import React from "react";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import { InvitationI } from "@/src/models/invitation";
import { ValidationErrors } from "@/src/utils/inviteAcceptanceValidation";

export interface Props {
  invitation: InvitationI;
  formData: {
    password: string;
    confirmPassword: string;
  };
  errors: ValidationErrors;
  submitting: boolean;
  onFieldChange: (field: string, value: string) => void;
  onClearError: (field: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Form for accepting invitation and setting password
 */
const InviteAcceptanceForm = ({
  invitation: _invitation,
  formData,
  errors,
  submitting,
  onFieldChange,
  onClearError,
  onSubmit,
}: Props) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        title="Password *"
        type="password"
        value={formData.password}
        onChange={(e) => {
          onFieldChange("password", e.target.value);
          onClearError("password");
        }}
        error={errors.password}
        placeholder="Minimum 8 characters"
      />

      <Input
        title="Confirm Password *"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => {
          onFieldChange("confirmPassword", e.target.value);
          onClearError("confirmPassword");
        }}
        error={errors.confirmPassword}
      />

      <Button type="submit" className="bg-primary w-full" disabled={submitting}>
        {submitting ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};

export default InviteAcceptanceForm;






