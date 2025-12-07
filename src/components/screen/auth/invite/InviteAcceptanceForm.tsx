/**
 * Invite Acceptance Form Component
 */
"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import { InvitationI } from "@/src/models/invitation";
import { ValidationErrors } from "@/src/utils/inviteAcceptanceValidation";

export interface Props {
  invitation: InvitationI;
  formData: {
    name: string;
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        title="Full Name *"
        type="text"
        value={formData.name}
        onChange={(e) => {
          onFieldChange("name", e.target.value);
          onClearError("name");
        }}
        error={errors.name}
        placeholder="Enter your full name"
      />

      <Input
        title="Password *"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={(e) => {
          onFieldChange("password", e.target.value);
          onClearError("password");
        }}
        error={errors.password}
        placeholder="Minimum 8 characters"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        }
      />

      <Input
        title="Confirm Password *"
        type={showConfirmPassword ? "text" : "password"}
        value={formData.confirmPassword}
        onChange={(e) => {
          onFieldChange("confirmPassword", e.target.value);
          onClearError("confirmPassword");
        }}
        error={errors.confirmPassword}
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors cursor-pointer"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        }
      />

      <Button type="submit" className="bg-primary w-full" disabled={submitting}>
        {submitting ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};

export default InviteAcceptanceForm;






