/**
 * Invitation Form Fields Component
 */
"use client";

import React from "react";
import Input from "@/src/components/core/Input";
import Select from "@/src/components/core/Select";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { InvitationRole } from "@/src/models/invitation";
import { ValidationErrors } from "@/src/utils/invitationValidation";

export interface Props {
  email: string;
  role: InvitationRole;
  expiresInDays: string;
  errors: ValidationErrors;
  onEmailChange: (email: string) => void;
  onRoleChange: (role: InvitationRole) => void;
  onExpiresInDaysChange: (days: string) => void;
  onClearError: (field: string) => void;
}

/**
 * Form fields for generating invitations
 */
const InvitationFormFields = ({
  email,
  role,
  expiresInDays,
  errors,
  onEmailChange,
  onRoleChange,
  onExpiresInDaysChange,
  onClearError,
}: Props) => {
  return (
    <div className="space-y-4">
      <Input
        title="Email Address *"
        type="email"
        value={email}
        onChange={(e) => {
          onEmailChange(e.target.value);
          onClearError("email");
        }}
        placeholder="student@university.edu"
        error={errors.email}
      />

      <Select
        title="Role *"
        options={[
          { label: "Student", value: "student" },
          { label: "Supervisor", value: "supervisor" },
        ]}
        value={role}
        onChange={(option) => {
          const roleValue =
            typeof option === "string"
              ? (option as InvitationRole)
              : (option.value as InvitationRole);
          onRoleChange(roleValue);
          onClearError("role");
        }}
        placeHolder="Select role"
        error={errors.role}
      />

      <Input
        title="Expires In (Days) *"
        type="number"
        value={expiresInDays}
        onChange={(e) => {
          onExpiresInDaysChange(e.target.value);
          onClearError("expiresInDays");
        }}
        placeholder="7"
        min="1"
        max="30"
        error={errors.expiresInDays}
      />

      {errors.email && <ErrorMessage message={errors.email} />}
      {errors.role && <ErrorMessage message={errors.role} />}
      {errors.expiresInDays && <ErrorMessage message={errors.expiresInDays} />}
    </div>
  );
};

export default InvitationFormFields;





