/**
 * Invitation Acceptance Page - Students/Supervisors set password and complete profile
 * PRD Reference: Section 4 - Students receive invitation links and set password
 */
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/hooks/useToast";

import InviteAcceptanceForm from "@/src/components/screen/auth/invite/InviteAcceptanceForm";
import { useInviteAcceptance } from "@/src/hooks/useInviteAcceptance";

export default function InviteAcceptancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    invitation,
    validating,
    formData,
    errors,
    submitting,
    setFieldValue,
    clearError,
    handleSubmit,
  } = useInviteAcceptance(token);

  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Invitation</h1>
            <p className="text-gray-600 mb-4">
              This invitation link is invalid or has expired.
            </p>
            <Button onClick={() => router.push("/")} className="bg-primary">
              Go to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-pale">
      <Card className="max-w-md w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Accept Invitation</h1>
          <p className="text-gray-600">
            Complete your profile to join StrikeForce as a{" "}
            <span className="capitalize font-medium">{invitation.role}</span>
          </p>
        </div>

        <InviteAcceptanceForm
          invitation={invitation}
          formData={formData}
          errors={errors}
          submitting={submitting}
          onFieldChange={setFieldValue}
          onClearError={clearError}
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit(token);
          }}
        />
      </Card>

      
    </div>
  );
}

