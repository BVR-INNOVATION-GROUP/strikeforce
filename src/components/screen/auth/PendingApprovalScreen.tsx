"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store";
import Button from "@/src/components/core/Button";
import { Clock, LogOut, ShieldAlert } from "lucide-react";
import { OrganizationI } from "@/src/models/organization";

export interface Props {
  organization?: OrganizationI;
  userRole: "partner" | "university-admin";
}

/**
 * Pending Approval Screen
 * Shown when user's organization KYC is pending approval
 * PRD Reference: Section 4 - Organizations must be approved before accessing dashboard
 */
export default function PendingApprovalScreen({ organization, userRole }: Props) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // Force full page reload to ensure middleware sees cleared cookies
    // Wait longer to ensure all cleanup completes
    // The logout flag will be cleared by onRehydrateStorage after preventing rehydration
    setTimeout(() => {
      window.location.href = "/";
    }, 200);
  };

  const orgName = organization?.name || "Your organization";
  const kycStatus = organization?.kycStatus || "PENDING";

  return (
    <div className="flex items-center justify-center min-h-screen bg-pale p-4">
      <div className="max-w-2xl w-full bg-paper rounded-lg shadow-custom border border-custom p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-yellow-50 rounded-full">
              <Clock size={48} className="text-yellow-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Pending Approval</h1>
          <p className="text-gray-600">
            Your account is awaiting Super Admin approval
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {/* Status Card */}
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-4">
              <ShieldAlert size={24} className="text-yellow-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">KYC Under Review</h3>
                <p className="text-gray-700 mb-2">
                  <strong>{orgName}</strong> is currently being reviewed by our Super Admin team.
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-semibold capitalize">{kycStatus.toLowerCase()}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Our team will review your KYC documents and organization details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>You'll receive an email notification once your account is approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Once approved, you'll have full access to your dashboard</span>
                </li>
              </ul>
            </div>

            {userRole === "partner" && (
              <div className="p-4 bg-pale rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Partner organizations:</strong> After approval, you'll be able to submit projects,
                  negotiate milestones, and fund escrow accounts.
                </p>
              </div>
            )}

            {userRole === "university-admin" && (
              <div className="p-4 bg-pale rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>University admins:</strong> After approval, you'll be able to onboard supervisors
                  and students, screen applications, and manage project assignments.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleLogout}
            className="flex-1 bg-pale text-primary border border-custom"
          >
            <LogOut size={16} className="mr-2" />
            Log Out
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="flex-1 bg-primary"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

