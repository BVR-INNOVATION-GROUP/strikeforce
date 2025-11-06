/**
 * Edit Organization Modal - Super Admin can edit organization details
 */
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import { OrganizationI } from "@/src/models/organization";
import { validateOrganizationSignup, OrganizationSignupFormData, ValidationErrors } from "@/src/utils/organizationSignupValidation";
import { useToast } from "@/src/hooks/useToast";

export interface Props {
  open: boolean;
  organization: OrganizationI | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal for super admin to edit organizations
 */
const EditOrganizationModal = ({ open, organization, onClose, onSuccess }: Props) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<OrganizationSignupFormData>({
    orgName: "",
    email: "",
    contactName: "",
    phone: "",
    address: "",
    website: "",
    description: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  /**
   * Populate form with organization data when organization changes
   */
  useEffect(() => {
    if (organization) {
      setFormData({
        orgName: organization.name || "",
        email: organization.email || "",
        contactName: organization.billingProfile?.contactName || "",
        phone: organization.billingProfile?.phone || "",
        address: organization.billingProfile?.address || "",
        website: organization.billingProfile?.website || "",
        description: "", // Description is not in OrganizationI model currently
      });
      setErrors({});
    }
  }, [organization]);

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
   */
  const validate = (): boolean => {
    const validationErrors = validateOrganizationSignup(formData, organization?.type === "UNIVERSITY");
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  /**
   * Handle form submission
   * Updates organization details
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organization) return;

    if (!validate()) {
      showError("Please fix the errors before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.orgName,
          email: formData.email,
          billingProfile: {
            ...organization.billingProfile,
            contactName: formData.contactName,
            phone: formData.phone,
            address: formData.address,
            website: formData.website || undefined,
            orgId: organization.id,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update organization");
      }

      const updated = await response.json();
      showSuccess(`${updated.name} has been updated`);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update organization:", error);
      showError(error instanceof Error ? error.message : "Failed to update organization. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle modal close - reset form
   */
  const handleClose = () => {
    if (organization) {
      // Reset to organization data
      setFormData({
        orgName: organization.name || "",
        email: organization.email || "",
        contactName: organization.billingProfile?.contactName || "",
        phone: organization.billingProfile?.phone || "",
        address: organization.billingProfile?.address || "",
        website: organization.billingProfile?.website || "",
        description: "",
      });
    }
    setErrors({});
    onClose();
  };

  if (!organization) return null;

  const orgTypeName = organization.type === "UNIVERSITY" ? "University" : "Organization";

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={`Edit ${orgTypeName}`}
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
        >
          {submitting ? "Updating..." : "Update Organization"}
        </Button>,
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
      </form>
    </Modal>
  );
};

export default EditOrganizationModal;

