"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store";
import { OrganizationI } from "@/src/models/organization";
import PendingApprovalScreen from "@/src/components/screen/auth/PendingApprovalScreen";
import { organizationRepository } from "@/src/repositories/organizationRepository";

export interface Props {
  children: React.ReactNode;
}

/**
 * KYC Route Protector
 * Checks organization KYC status and redirects to pending screen if not approved
 * PRD Reference: Section 4 - Organizations must be approved before accessing dashboard
 */
export default function KYCRouteProtector({ children }: Props) {
  const { user } = useAuthStore();
  const [organization, setOrganization] = useState<OrganizationI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkKYCStatus = async () => {
      // Only check for partner and university-admin roles
      if (!user || (user.role !== "partner" && user.role !== "university-admin")) {
        setLoading(false);
        return;
      }

      try {
        // Get organization by user's orgId or universityId
        const orgId = user.orgId || user.universityId;
        if (!orgId) {
          setLoading(false);
          return;
        }

        const org = await organizationRepository.getById(orgId);
        setOrganization(org);

        // If KYC is not approved, user will see pending screen (handled in render)
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      } finally {
        setLoading(false);
      }
    };

    checkKYCStatus();
  }, [user]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is partner or university-admin and KYC is not approved, show pending screen
  if (
    user &&
    (user.role === "partner" || user.role === "university-admin") &&
    organization &&
    organization.kycStatus !== "APPROVED"
  ) {
    return (
      <PendingApprovalScreen
        organization={organization}
        userRole={user.role}
      />
    );
  }

  // Otherwise, render children
  return <>{children}</>;
}

