/**
 * Account Verification Page - Verify email address
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/src/components/base/AuthLayout";
import Button from "@/src/components/core/Button";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/src/hooks/useToast";

const VerifyAccountPage = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  /**
   * Handle verification
   */
  const handleVerify = async () => {
    setVerifying(true);
    try {
      // In production, this would verify the token from URL params
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setVerified(true);
      showSuccess("Account verified successfully!");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("Verification failed:", error);
      showError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  /**
   * Handle resend verification email
   */
  const handleResend = async () => {
    try {
      // In production, this would resend verification email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccess("Verification email sent!");
    } catch (error) {
      console.error("Failed to resend email:", error);
      showError("Failed to resend email. Please try again.");
    }
  };

  if (verified) {
    return (
      <AuthLayout
        rightContent={{
          title: "Account verified!",
          description:
            "Your account has been successfully verified. You can now log in and start using StrikeForce.",
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Account Verified!</h1>
          <p className="text-sm opacity-60 mb-8">
            Your email has been successfully verified. Redirecting to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      rightContent={{
        title: "Verify your account",
        description:
          "We've sent a verification link to your email address. Please click the link to verify your account and activate all features.",
      }}
    >
      <div>
        <div className="w-16 h-16 bg-pale-primary rounded-full flex items-center justify-center mb-6">
          <Mail className="text-primary" size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Verify your account</h1>
        <p className="text-sm opacity-60 mb-8">
          We&apos;ve sent a verification link to your email address. Please check
          your inbox and click the link to verify your account.
        </p>

        <div className="space-y-4">
          <Button
            onClick={handleVerify}
            className="w-full bg-primary"
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "I've verified my email"}
          </Button>

          <div className="text-center">
            <p className="text-sm opacity-60 mb-2">
              Didn&apos;t receive the email?
            </p>
            <button
              onClick={handleResend}
              className="text-sm text-primary hover:underline"
            >
              Resend verification email
            </button>
          </div>

          <Link href="/auth/login">
            <Button className="w-full bg-pale mt-4">
              <ArrowLeft size={16} />
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyAccountPage;


