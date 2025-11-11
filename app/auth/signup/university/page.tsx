/**
 * University Organization Sign-up Page
 * PRD Reference: Section 4 - Universities sign up → Super Admin approval
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";

import { organizationService } from "@/src/services/organizationService";
import OrganizationSignupForm from "@/src/components/screen/auth/signup/OrganizationSignupForm";
import { validateOrganizationSignup, OrganizationSignupFormData, ValidationErrors } from "@/src/utils/organizationSignupValidation";

export default function UniversitySignUpPage() {
  const router = useRouter();
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
  const { showSuccess, showError } = useToast();

  /**
   * Validate form data
   */
  const validate = (): boolean => {
    const validationErrors = validateOrganizationSignup(formData, true);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

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
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showError("Please fix the errors before submitting");
      return;
    }

    setSubmitting(true);
    try {
      // Create organization with PENDING KYC status
      // Note: billingProfile.orgId will be set by the API route after organization creation
      const org = await organizationService.createOrganization({
        name: formData.orgName,
        type: "UNIVERSITY",
        email: formData.email,
        kycStatus: "PENDING",
        billingProfile: {
          contactName: formData.contactName,
          phone: formData.phone,
          address: formData.address,
          website: formData.website,
          orgId: 0, // Temporary placeholder - will be set by API route
        },
      });

      showSuccess("University registered! Your application is pending Super Admin approval.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: any) {
      console.error("Failed to register university:", error);
      showError(error?.message || "Failed to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-pale py-8">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">University Sign Up</h1>
          <p className="text-gray-600">
            Register your university to connect students with partner organizations.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <OrganizationSignupForm
            formData={formData}
            errors={errors}
            isUniversity={true}
            onFieldChange={(field, value) => {
              setFormData({ ...formData, [field]: value });
            }}
            onClearError={clearError}
          />
          <Button
            type="submit"
            className="bg-primary w-full mt-4"
            disabled={submitting}
          >
            {submitting ? "Registering..." : "Register University"}
          </Button>
        </form>
      </Card>
    </div>
  );
}