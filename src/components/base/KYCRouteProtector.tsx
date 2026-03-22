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
  const { user, organization: authOrg } = useAuthStore();
  const [organization, setOrganization] = useState<OrganizationI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkKYCStatus = async () => {
      const isPartnerSurface =
        user?.role === "partner" ||
        (user?.role === "delegated-admin" && authOrg?.type === "PARTNER");
      const isUniversitySurface =
        user?.role === "university-admin" ||
        (user?.role === "delegated-admin" && authOrg?.type === "UNIVERSITY");

      if (!user || (!isPartnerSurface && !isUniversitySurface)) {
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
  }, [user, authOrg?.type]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  const isPartnerKyc =
    user &&
    (user.role === "partner" ||
      (user.role === "delegated-admin" && authOrg?.type === "PARTNER"));

  if (
    isPartnerKyc &&
    organization &&
    organization.kycStatus !== "APPROVED"
  ) {
    return (
      <PendingApprovalScreen
        organization={organization}
        userRole={user.role === "delegated-admin" ? "partner" : user.role}
      />
    );
  }

  const isUniversityKyc =
    user &&
    (user.role === "university-admin" ||
      (user.role === "delegated-admin" && authOrg?.type === "UNIVERSITY"));

  if (
    isUniversityKyc &&
    organization &&
    organization.kycStatus !== "APPROVED"
  ) {
    return (
      <PendingApprovalScreen
        organization={organization}
        userRole={
          user.role === "delegated-admin" ? "university-admin" : user.role
        }
      />
    );
  }

  // Otherwise, render children
  return <>{children}</>;
}

