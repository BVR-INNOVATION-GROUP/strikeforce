/**
 * Reset Password Page - Set new password after clicking reset link
 */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/src/components/base/AuthLayout";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/src/hooks/useToast";
import { passwordResetService } from "@/src/services/passwordResetService";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string>("");

  /**
   * Get token from URL query parameter
   */
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setTokenError("Invalid reset link. Please request a new password reset.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  /**
   * Validate form data
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    if (!token) {
      setTokenError("Reset token is missing. Please request a new password reset.");
      return;
    }

    setLoading(true);
    try {
      await passwordResetService.resetPassword(token, formData.password);
      setReset(true);
      showSuccess("Password reset successfully!");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("Password reset failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Password reset failed. Please try again.";
      showError(errorMessage);
      
      // Check if token is invalid or expired
      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("Invalid") ||
        errorMessage.includes("token")
      ) {
        setTokenError(errorMessage);
      }
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

  // Show error if token is missing or invalid
  if (tokenError) {
    return (
      <AuthLayout
        rightContent={{
          title: "Invalid Reset Link",
          description:
            "The password reset link is invalid or has expired. Please request a new password reset.",
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-pale-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Invalid Reset Link</h1>
          <p className="text-sm opacity-60 mb-8">{tokenError}</p>
          <Link href="/auth/forgot-password">
            <Button className="w-full bg-primary">
              Request New Reset Link
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button className="w-full bg-pale mt-4">
              <ArrowLeft size={16} />
              Back to login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (reset) {
    return (
      <AuthLayout
        rightContent={{
          title: "Password reset successful!",
          description:
            "Your password has been successfully reset. You can now log in with your new password.",
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Password Reset!</h1>
          <p className="text-sm opacity-60 mb-8">
            Your password has been successfully reset. Redirecting to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      rightContent={{
        title: "Set a new password",
        description:
          "Choose a strong password that you haven't used before. Make sure it's at least 8 characters long and includes a mix of letters, numbers, and symbols.",
      }}
    >
      <div>
        <div className="w-16 h-16 bg-pale-primary rounded-full flex items-center justify-center mb-6">
          <Lock className="text-primary" size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center">Reset password</h1>
        <p className="text-sm opacity-60 mb-8 text-center">
          Enter your new password below
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            title="New Password *"
            placeholder="Create a new password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              clearError("password");
            }}
            error={errors.password}
          />
          <p className="text-xs opacity-60 -mt-2">
            Must be at least 8 characters.
          </p>

          <Input
            type="password"
            title="Confirm Password *"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value });
              clearError("confirmPassword");
            }}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            className="w-full bg-primary mt-6"
            disabled={loading}
          >
            {loading ? "Resetting password..." : "Reset password"}
          </Button>
        </form>

        <Link href="/auth/login">
          <Button className="w-full bg-pale mt-4">
            <ArrowLeft size={16} />
            Back to login
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={
      <AuthLayout
        rightContent={{
          title: "Loading...",
          description: "Please wait while we load the reset password page.",
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-pale-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Lock className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Loading...</h1>
        </div>
      </AuthLayout>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;

