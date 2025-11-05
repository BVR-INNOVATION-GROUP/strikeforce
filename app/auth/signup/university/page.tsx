/**
 * University Organization Sign-up Page
 * PRD Reference: Section 4 - Universities sign up → submit KYC → Super Admin approval
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";

import { kycService } from "@/src/services/kycService";
import { organizationService } from "@/src/services/organizationService";
import OrganizationSignupForm from "@/src/components/screen/auth/signup/OrganizationSignupForm";
import KYCStepView from "@/src/components/screen/auth/signup/KYCStepView";
import { validateOrganizationSignup, OrganizationSignupFormData, ValidationErrors } from "@/src/utils/organizationSignupValidation";

export default function UniversitySignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "kyc">("form");
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
  const [orgId, setOrgId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const validate = (): boolean => {
    const validationErrors = validateOrganizationSignup(formData, true);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof ValidationErrors];
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showError("Please fix the errors before submitting");
      return;
    }

    setSubmitting(true);
    try {
      // Create organization with PENDING KYC status
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
        },
        description: formData.description,
      });

      setOrgId(org.id);
      setStep("kyc");
      showSuccess("University registered! Please upload KYC documents.");
    } catch (error: any) {
      console.error("Failed to register university:", error);
      showError(error.message || "Failed to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKYCSubmit = async (documentData: any) => {
    if (!orgId) return;

    try {
      await kycService.uploadDocument(documentData);
      showSuccess(
        "KYC documents uploaded! Your application is pending Super Admin approval."
      );
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      console.error("Failed to upload KYC:", error);
      throw error;
    }
  };

  if (step === "kyc" && orgId) {
    return (
      <KYCStepView
        orgId={orgId}
        isUniversity={true}
        onKYCSubmit={handleKYCSubmit}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-pale">
      <Card className="max-w-2xl w-full">
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
            {submitting ? "Registering..." : "Continue to KYC Upload"}
          </Button>
        </form>
      </Card>

      
    </div>
  );
}

