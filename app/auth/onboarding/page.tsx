/**
 * Onboarding Page - User setup after signup
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/src/components/base/AuthLayout";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { UserRole } from "@/src/models/user";

const OnboardingPage = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: "" as UserRole | "",
    organization: "",
    skills: "",
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  /**
   * Validate current step
   */
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.role) {
        newErrors.role = "Please select a role";
      }
    }

    if (step === 2) {
      if (!formData.organization.trim()) {
        newErrors.organization = "Organization name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle next step
   */
  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  /**
   * Handle onboarding completion
   */
  const handleComplete = async () => {
    setLoading(true);
    try {
      // In production, this would save onboarding data
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showSuccess("Onboarding completed!");
      
      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        partner: "/partner",
        student: "/student",
        supervisor: "/supervisor",
        "university-admin": "/university-admin",
        "super-admin": "/super-admin",
      };

      router.push(roleRoutes[formData.role] || "/partner");
    } catch (error) {
      console.error("Onboarding failed:", error);
      showError("Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error for a specific field
   */
  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  /**
   * Get role options
   */
  const roleOptions: { value: UserRole; label: string; description: string }[] = [
    { value: "partner", label: "Partner", description: "Post projects and collaborate" },
    { value: "student", label: "Student", description: "Work on real-world projects" },
    { value: "supervisor", label: "Supervisor", description: "Guide and mentor students" },
    { value: "university-admin", label: "University Admin", description: "Manage university operations" },
  ];

  return (
    <AuthLayout
      rightContent={{
        title: "Welcome to StrikeForce",
        description:
          "Let's get you set up. This will only take a few minutes. We'll help you complete your profile and get started with the platform.",
      }}
    >
      <div>
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of 3</span>
            <span className="text-sm opacity-60">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-very-pale rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">Select your role</h1>
            <p className="text-sm opacity-60 mb-6 text-center">
              Choose the role that best describes you
            </p>

            <div className="space-y-3">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: option.value });
                    clearError("role");
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.role === option.value
                      ? "border-primary bg-pale-primary"
                      : "border-custom hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold mb-1">{option.label}</div>
                  <div className="text-sm opacity-60">{option.description}</div>
                </button>
              ))}
            </div>

            {errors.role && (
              <p className="text-sm text-red-500 mt-2">{errors.role}</p>
            )}
          </div>
        )}

        {/* Step 2: Organization */}
        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">Tell us about yourself</h1>
            <p className="text-sm opacity-60 mb-6 text-center">
              Help us personalize your experience
            </p>

            <div className="space-y-4">
              <Input
                type="text"
                title="Organization *"
                placeholder="Enter your organization name"
                value={formData.organization}
                onChange={(e) => {
                  setFormData({ ...formData, organization: e.target.value });
                  clearError("organization");
                }}
                error={errors.organization}
              />

              <Input
                type="text"
                title="Skills"
                placeholder="e.g., React, Node.js, Python"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* Step 3: Bio */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">Complete your profile</h1>
            <p className="text-sm opacity-60 mb-6 text-center">
              Add a brief bio to help others get to know you
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="mb-3 text-sm">Bio</label>
                <textarea
                  className="border p-3 text-base border-custom rounded-lg outline-none focus:border-primary min-h-[120px] resize-none"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <Button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-pale"
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            className={`${step > 1 ? "flex-1" : "w-full"} bg-primary`}
            disabled={loading}
          >
            {loading
              ? "Completing..."
              : step === 3
              ? "Complete Setup"
              : "Continue"}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default OnboardingPage;

