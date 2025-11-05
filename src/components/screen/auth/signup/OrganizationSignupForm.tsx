/**
 * Organization Signup Form Component
 */
"use client";

import React from "react";
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
        title="Website (Optional)"
        type="url"
        value={formData.website}
        onChange={(e) => onFieldChange("website", e.target.value)}
        placeholder="https://example.com"
      />
      <TextArea
        title="Description (Optional)"
        value={formData.description}
        onChange={(e) => onFieldChange("description", e.target.value)}
        placeholder={`Brief description of your ${orgTypeName.toLowerCase()}...`}
        rows={4}
      />
    </div>
  );
};

export default OrganizationSignupForm;





