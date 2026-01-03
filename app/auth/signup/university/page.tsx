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
import { ApiError, POST } from "@/base/index"

import MultiStepOrganizationForm from "@/src/components/screen/auth/signup/MultiStepOrganizationForm";
import { validateOrganizationSignup, OrganizationSignupFormData, ValidationErrors } from "@/src/utils/organizationSignupValidation";
import { BackendLoginResponse } from "@/src/lib/server";
import { BASE_URL } from "@/src/api/client";

const errorFieldSteps: (keyof ValidationErrors)[][] = [
  ["orgName", "email", "password"],
  ["contactName", "phone", "address"],
];

export default function UniversitySignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<OrganizationSignupFormData>({
    orgName: "",
    password: "",
    email: "",
    contactName: "",
    phone: "",
    address: "",
    website: "",
    description: "",
    logo: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { showSuccess, showError } = useToast();

  /**
   * Validate form data
   */
  const getErrorStep = (validationErrors: ValidationErrors): number | null => {
    for (let i = 0; i < errorFieldSteps.length; i++) {
      if (errorFieldSteps[i].some((field) => validationErrors[field])) {
        return i;
      }
    }
    return null;
  };

  const validate = (): boolean => {
    const validationErrors = validateOrganizationSignup(formData, true);
    setErrors(validationErrors);
    const hasErrors = Object.keys(validationErrors).length > 0;
    if (hasErrors) {
      const errorStep = getErrorStep(validationErrors);
      if (errorStep !== null) {
        setCurrentStep(errorStep);
      }
    }
    return !hasErrors;
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
      // const org = await POST<OrganizationSignupFormData>("/user/signup", {
      //   name: formData.orgName,
      //   type: "UNIVERSITY",
      //   email: formData.email,
      //   kycStatus: "PENDING",
      //   billingProfile: {
      //     contactName: formData.contactName,
      //     phone: formData.phone,
      //     address: formData.address,
      //     website: formData.website,
      //     orgId: 0, // Temporary placeholder - will be set by API route
      //   },
      // });

      // Create user account
      const userResponse = await POST<BackendLoginResponse>("user/signup", {
        email: formData.email,
        password: formData.password,
        name: formData.contactName,
        role: "university-admin",
      });

      const authData = userResponse.data;

      // Create the organization 
      interface OrgRequest {
        name: string
        type: "university"
      }

      await POST<OrgRequest>("api/v1/org", {
        name: formData.orgName,
        type: "university"
      }, authData?.token)

      // Upload logo if provided
      if (logoFile && authData?.token) {
        try {
          const formDataLogo = new FormData();
          formDataLogo.append("logo", logoFile);

          const logoResponse = await fetch(
            `${BASE_URL}/api/v1/org/upload-logo`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${authData?.token}`,
              },
              body: formDataLogo,
            }
          );

          if (!logoResponse.ok) {
            console.warn("Failed to upload logo, but continuing with registration");
          }
        } catch (error) {
          console.warn("Error uploading logo:", error);
        }
      }

      // Show comprehensive success notification with account state and next actions
      const notificationMessage = `Account created successfully! Your university account "${formData.orgName}" has been registered and is pending Super Admin approval. You will receive an email notification once your account is approved. Please log in with your credentials to check your approval status.`;
      
      showSuccess(notificationMessage);
      
      // Redirect to login page after showing notification
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error: any) {
      console.error("Failed to register university:", error);
      if (error instanceof ApiError) {
        const backendMsg =
          (error.payload?.msg as string | undefined)?.trim() ||
          error.message.replace(/^\[\d+\]\s*/, "");
        showError(
          backendMsg || "Failed to register. Please verify your details and try again."
        );
      } else {
        showError(error?.message || "Failed to register. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-pale py-8 px-4">
      <Card className="max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-default">University Sign Up</h1>
          <p className="text-secondary">
            Register your university to connect students with partner organizations.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <MultiStepOrganizationForm
            formData={formData}
            errors={errors}
            isUniversity={true}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onFieldChange={(field, value) => {
              setFormData({ ...formData, [field]: value });
            }}
            onClearError={clearError}
            onLogoFileChange={(file) => setLogoFile(file)}
          />

          {currentStep === 2 && (
            <div className="mt-8 pt-6 border-t border-custom">
              <Button
                type="submit"
                className="bg-primary w-full py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}