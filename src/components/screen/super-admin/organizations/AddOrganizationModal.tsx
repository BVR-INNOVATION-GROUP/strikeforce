/**
 * Add Organization Modal - Super Admin can create organizations with pre-approved status
 */
"use client";

import React, { useState } from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import Select from "@/src/components/core/Select";
import { OrganizationType } from "@/src/models/organization";
import { validateOrganizationSignup, OrganizationSignupFormData, ValidationErrors } from "@/src/utils/organizationSignupValidation";
import { useToast } from "@/src/hooks/useToast";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { ApiError } from "@/base/index";

export interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: OrganizationType;
}

/**
 * Modal for super admin to add organizations (pre-approved)
 */
const AddOrganizationModal = ({ open, onClose, onSuccess, defaultType }: Props) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<OrganizationSignupFormData>({
    orgName: "",
    email: "",
    contactName: "",
    phone: "",
    address: "",
    website: "",
    description: "",
    password: "", // Not used for superadmin - backend generates password
  });
  const [orgType, setOrgType] = useState<OrganizationType>(defaultType || "PARTNER");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Hide type selector if defaultType is provided (we know the type from the page)
  const showTypeSelector = !defaultType;

  /**
   * Clear error for a specific field
   */
  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof ValidationErrors];
      return newErrors;
    });
  };

  /**
   * Validate form data
   * Skip password validation since backend generates it for superadmin-created orgs
   */
  const validate = (): boolean => {
    const validationErrors = validateOrganizationSignup(formData, orgType === "UNIVERSITY", true);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  /**
   * Handle form submission
   * Creates organization with APPROVED status
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showError("Please fix the errors before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const normalizedType =
        orgType === "UNIVERSITY" ? "university" : "company";

      const payload: Partial<Record<string, unknown>> = {
        name: formData.orgName.trim(),
        type: normalizedType,
        address: formData.address.trim(),
        website: formData.website?.trim() || undefined,
        brandColor: undefined,
      };

      // Preserve additional details so backend can support them later
      const billingProfile = {
        email: formData.email.trim(),
        contactName: formData.contactName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        website: formData.website?.trim() || undefined,
      };

      payload.billingProfile = billingProfile;
      payload.description = formData.description?.trim() || undefined;

      const organization = await organizationRepository.create(payload as any);
      showSuccess(
        `${organization.name} has been created. Review the details and approve when ready.`
      );
      
      // Reset form
      setFormData({
        orgName: "",
        email: "",
        contactName: "",
        phone: "",
        address: "",
        website: "",
        description: "",
        password: "", // Not used for superadmin - backend generates password
      });
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create organization:", error);
      if (error instanceof ApiError) {
        const backendMsg =
          (error.payload?.msg as string | undefined)?.trim() ||
          error.message.replace(/^\[\d+\]\s*/, "");
        showError(backendMsg || "Failed to create organization. Please try again.");
      } else {
        showError(
          error instanceof Error
            ? error.message
            : "Failed to create organization. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle modal close - reset form
   */
  const handleClose = () => {
    setFormData({
      orgName: "",
      email: "",
      contactName: "",
      phone: "",
      address: "",
      website: "",
      description: "",
      password: "", // Not used for superadmin - backend generates password
    });
    setErrors({});
    onClose();
  };

  const orgTypeName = orgType === "UNIVERSITY" ? "University" : "Organization";

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={`Add ${orgTypeName} (Pre-approved)`}
      actions={[
        <Button
          key="cancel"
          onClick={handleClose}
          className="bg-pale"
          disabled={submitting}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          onClick={handleSubmit}
          className="bg-primary text-white"
          disabled={submitting}
          loading={submitting}
        >
          Create Organization
        </Button>,
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Organization Type Selector - only show if no defaultType */}
        {showTypeSelector && (
          <Select
            title="Organization Type *"
            value={orgType}
            onChange={(e) => {
              setOrgType(e.target.value as OrganizationType);
              setErrors({});
            }}
            options={[
              { value: "PARTNER", label: "Partner (Company)" },
              { value: "UNIVERSITY", label: "University" },
            ]}
          />
        )}

        <Input
          title={`${orgTypeName} Name *`}
          value={formData.orgName}
          onChange={(e) => {
            setFormData({ ...formData, orgName: e.target.value });
            clearError("orgName");
          }}
          placeholder={`Enter ${orgTypeName.toLowerCase()} name`}
          error={errors.orgName}
        />

        <Input
          title="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            clearError("email");
          }}
          placeholder="contact@example.com"
          error={errors.email}
        />

        <Input
          title="Contact Name *"
          value={formData.contactName}
          onChange={(e) => {
            setFormData({ ...formData, contactName: e.target.value });
            clearError("contactName");
          }}
          placeholder="John Doe"
          error={errors.contactName}
        />

        <Input
          title="Phone *"
          type="tel"
          value={formData.phone}
          onChange={(e) => {
            setFormData({ ...formData, phone: e.target.value });
            clearError("phone");
          }}
          placeholder="+1234567890"
          error={errors.phone}
        />

        <Input
          title="Address *"
          value={formData.address}
          onChange={(e) => {
            setFormData({ ...formData, address: e.target.value });
            clearError("address");
          }}
          placeholder="Street address, City, Country"
          error={errors.address}
        />

        <Input
          title="Website (Optional)"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://example.com"
        />

        <TextArea
          title="Description (Optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={`Brief description of ${orgTypeName.toLowerCase()}`}
          rows={4}
        />

        <div className="bg-pale-primary p-3 rounded-lg">
          <p className="text-sm text-primary font-medium">
            Note: Organizations created by Super Admin are automatically pre-approved.
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default AddOrganizationModal;

