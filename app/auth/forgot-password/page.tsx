/**
 * Forgot Password Page - Request password reset
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/src/components/base/AuthLayout";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import { Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/src/hooks/useToast";
import { passwordResetService } from "@/src/services/passwordResetService";

const ForgotPasswordPage = () => {
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  /**
   * Validate email format
   */
  const validate = (): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    setError("");
    return true;
  };

  /**
   * Handle form submission - request password reset
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await passwordResetService.requestPasswordReset(email);
      showSuccess("Password reset link sent to your email!");
      setSent(true);
    } catch (error) {
      console.error("Failed to send reset email:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send reset email. Please try again.";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  if (sent) {
    return (
      <AuthLayout
        rightContent={{
          title: "Check your email",
          description:
            "We've sent you a password reset link. Please check your inbox and follow the instructions to reset your password.",
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-pale-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Check your email</h1>
          <p className="text-sm opacity-60 mb-8">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm opacity-60 mb-6">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </p>
          <Link href="/auth/login">
            <Button className="w-full bg-primary">
              <ArrowLeft size={16} />
              Back to login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      rightContent={{
        title: "Reset your password",
        description:
          "Enter your email address and we'll send you a link to reset your password. Make sure to use the same email you used to create your account.",
      }}
    >
      <div>
        <h1 className="text-3xl font-bold mb-2 text-center">Forgot password?</h1>
        <p className="text-sm opacity-60 mb-8 text-center">
          No worries, we&apos;ll send you reset instructions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            title="Email *"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            error={error}
          />

          <Button
            type="submit"
            className="w-full bg-primary mt-6"
            disabled={loading}
          >
            {loading ? "Sending..." : "Reset password"}
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

export default ForgotPasswordPage;

