/**
 * Sign Up Page - User registration
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/src/components/base/AuthLayout";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";

const SignUpPage = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  /**
   * Validate form data
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // In production, this would be an API call
      // For now, redirect to onboarding
      showSuccess("Account created successfully!");
      setTimeout(() => {
        router.push("/auth/onboarding");
      }, 1000);
    } catch (error) {
      console.error("Sign up failed:", error);
      showError("Sign up failed. Please try again.");
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

  return (
    <AuthLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2 text-center">Create account</h1>
        <p className="text-sm opacity-60 mb-8 text-center">
          Get started with StrikeForce today
        </p>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            title="First name *"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => {
              setFormData({ ...formData, firstName: e.target.value });
              clearError("firstName");
            }}
            error={errors.firstName}
          />

          <Input
            type="email"
            title="Email *"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              clearError("email");
            }}
            error={errors.email}
          />

          <div>
            <Input
              type="password"
              title="Password *"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                clearError("password");
              }}
              error={errors.password}
            />
            <p className="text-xs opacity-60 mt-1">
              Must be at least 8 characters.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary mt-6"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm opacity-60">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;

