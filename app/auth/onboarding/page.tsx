/**
 * Onboarding Page - Profile setup for partners and university admins
 * Students use the invite acceptance page instead
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/src/components/base/AuthLayout";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { useAuthStore } from "@/src/store";
import { userProfileService } from "@/src/services/userProfileService";
import { userRepository } from "@/src/repositories/userRepository";

const OnboardingPage = () => {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    skills: "",
    phone: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  /**
   * Check authentication and role on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      let currentUser = user;
      
      // Wait for auth store to hydrate
      if (!currentUser) {
        // Try to get user from cookie/storage
        const cookieUser = document.cookie
          .split(";")
          .find((c) => c.trim().startsWith("user="));
        
        if (cookieUser) {
          try {
            const userData = JSON.parse(
              decodeURIComponent(cookieUser.split("=")[1])
            );
            // Load full user data
            const fullUser = await userRepository.getById(userData.id);
            if (fullUser) {
              await setUser(fullUser);
              currentUser = fullUser;
            }
          } catch (error) {
            console.error("Failed to load user:", error);
          }
        }
      }

      setCheckingAuth(false);

      // Redirect if not authenticated or not partner/university-admin
      if (!currentUser || (currentUser.role !== "partner" && currentUser.role !== "university-admin")) {
        showError("Onboarding is only available for partners and university administrators");
        router.push("/auth/login");
        return;
      }

      // Pre-fill form with existing user data
      setFormData({
        name: currentUser.name || "",
        bio: currentUser.profile.bio || "",
        skills: currentUser.profile.skills?.join(", ") || "",
        phone: currentUser.profile.phone || "",
        location: currentUser.profile.location || "",
      });
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  /**
   * Validate current step
   */
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
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

    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  /**
   * Handle onboarding completion
   * Saves profile data to user account
   */
  const handleComplete = async () => {
    if (!user) {
      showError("User not found. Please log in again.");
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      // Parse skills from comma-separated string
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Update user profile
      const updatedUser = await userProfileService.updateProfile({
        name: formData.name,
        bio: formData.bio || undefined,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
      });

      // Update skills separately (if needed)
      if (skillsArray.length > 0) {
        const userWithSkills = {
          ...updatedUser,
          profile: {
            ...updatedUser.profile,
            skills: skillsArray,
          },
        };
        const finalUser = await userRepository.update(user.id, userWithSkills);
        await setUser(finalUser);
      } else {
        await setUser(updatedUser);
      }

      showSuccess("Profile completed successfully!");
      
      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        partner: "/partner",
        "university-admin": "/university-admin",
      };

      setTimeout(() => {
        router.push(roleRoutes[user.role] || "/partner");
      }, 1000);
    } catch (error) {
      console.error("Onboarding failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to complete onboarding. Please try again."
      );
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

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <AuthLayout>
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </AuthLayout>
    );
  }

  // Don't render if user is not partner/university-admin (will redirect)
  if (!user || (user.role !== "partner" && user.role !== "university-admin")) {
    return null;
  }

  return (
    <AuthLayout
      rightContent={{
        title: "Welcome to StrikeForce",
        description:
          "Let's complete your profile. This will only take a few minutes. We'll help you set up your account and get started with the platform.",
      }}
    >
      <div>
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of 2</span>
            <span className="text-sm opacity-60">{Math.round((step / 2) * 100)}%</span>
          </div>
          <div className="w-full bg-very-pale rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">Basic Information</h1>
            <p className="text-sm opacity-60 mb-6 text-center">
              Tell us about yourself
            </p>

            <div className="space-y-4">
              <Input
                type="text"
                title="Full Name *"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  clearError("name");
                }}
                error={errors.name}
              />

              <Input
                type="tel"
                title="Phone"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                }}
              />

              <Input
                type="text"
                title="Location"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                }}
              />
            </div>
          </div>
        )}

        {/* Step 2: Profile Details */}
        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">Profile Details</h1>
            <p className="text-sm opacity-60 mb-6 text-center">
              Add more information to complete your profile
            </p>

            <div className="space-y-4">
              <TextArea
                title="Bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => {
                  setFormData({ ...formData, bio: e.target.value });
                }}
                rows={4}
              />

              <Input
                type="text"
                title="Skills"
                placeholder="e.g., React, Node.js, Python (comma-separated)"
                value={formData.skills}
                onChange={(e) => {
                  setFormData({ ...formData, skills: e.target.value });
                }}
              />
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
              disabled={loading}
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
              ? "Saving..."
              : step === 2
              ? "Complete Setup"
              : "Continue"}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default OnboardingPage;

