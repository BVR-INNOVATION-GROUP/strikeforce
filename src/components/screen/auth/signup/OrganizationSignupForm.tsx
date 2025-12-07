/**
 * Organization Signup Form Component
 */
"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import { OrganizationSignupFormData, ValidationErrors } from "@/src/utils/organizationSignupValidation";

export interface Props {
  formData: OrganizationSignupFormData;
  errors: ValidationErrors;
  isUniversity?: boolean;
  onFieldChange: (field: keyof OrganizationSignupFormData, value: string) => void;
  onClearError: (field: string) => void;
}

/**
 * Reusable form for organization signup (Partner or University)
 */
const OrganizationSignupForm = ({
  formData,
  errors,
  isUniversity = false,
  onFieldChange,
  onClearError,
}: Props) => {
  const orgTypeName = isUniversity ? "University" : "Organization";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <Input
        title={`${orgTypeName} Name *`}
        value={formData.orgName}
        onChange={(e) => {
          onFieldChange("orgName", e.target.value);
          onClearError("orgName");
        }}
        placeholder={`Enter ${orgTypeName.toLowerCase()} name`}
        error={errors.orgName}
      />
      <Input
        title="Email *"
        type="email"
        value={formData.email}
        onChange={(e) => {
          onFieldChange("email", e.target.value);
          onClearError("email");
        }}
        placeholder="contact@example.com"
        error={errors.email}
      />
      <Input
        title="Contact Name *"
        value={formData.contactName}
        onChange={(e) => {
          onFieldChange("contactName", e.target.value);
          onClearError("contactName");
        }}
        placeholder="John Doe"
        error={errors.contactName}
      />
      <Input
        title="Phone *"
        type="tel"
        value={formData.phone}
        onChange={(e) => {
          onFieldChange("phone", e.target.value);
          onClearError("phone");
        }}
        placeholder="+1234567890"
        error={errors.phone}
      />
      <Input
        title="Address *"
        value={formData.address}
        onChange={(e) => {
          onFieldChange("address", e.target.value);
          onClearError("address");
        }}
        placeholder="Street address, City, Country"
        error={errors.address}
      />
      <Input
        title="Password *"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={(e) => {
          onFieldChange("password", e.target.value);
          onClearError("password");
        }}
        placeholder="At least 8 characters"
        error={errors.password}
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
        title="Website (Optional)"
        type="url"
        value={formData.website}
        onChange={(e) => onFieldChange("website", e.target.value)}
        placeholder="https://example.com"
      />
    </div>
  );
};

export default OrganizationSignupForm;









