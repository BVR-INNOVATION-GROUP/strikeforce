"use client";

import React, { useEffect, useState } from "react";
import Card from "@/src/components/core/Card";
import DataTable from "@/src/components/base/DataTable";
import { OrganizationI } from "@/src/models/organization";
import { KycDocumentI } from "@/src/models/kyc";
import { getKYCColumns } from "@/src/utils/kycColumns";
import KYCStatsCard from "@/src/components/screen/super-admin/kyc/KYCStatsCard";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { kycRepository } from "@/src/repositories/kycRepository";
import { useToast } from "@/src/hooks/useToast";

/**
 * Super Admin KYC Approvals - approve or reject organization KYC
 * Uses organizationRepository and kycRepository for data access
 */
export default function SuperAdminKYC() {
  const { showSuccess, showError } = useToast();
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [documents, setDocuments] = useState<Record<number, KycDocumentI[]>>({});
  const [loading, setLoading] = useState(true);

  /**
   * Fetch organizations and their KYC documents
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all organizations
      const orgs = await organizationRepository.getAll();
      setOrganizations(orgs);
      
      // Fetch KYC documents for each organization
      const docsMap: Record<number, KycDocumentI[]> = {};
      for (const org of orgs) {
        if (org.kycStatus === "PENDING") {
          const orgDocs = await kycRepository.getAll(org.id);
          docsMap[org.id] = orgDocs;
        }
      }
      setDocuments(docsMap);
    } catch (error) {
      console.error("Failed to load organizations:", error);
      showError("Failed to load KYC data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle organization KYC approval
   * @param orgId - Organization ID (numeric)
   */
  const handleApprove = async (orgId: number) => {
    try {
      const updated = await organizationRepository.update(orgId, {
        kycStatus: "APPROVED",
      });
      
      setOrganizations((prev) =>
        prev.map((org) => (org.id === orgId ? updated : org))
      );
      
      showSuccess("Organization KYC approved successfully");
    } catch (error) {
      console.error("Failed to approve organization:", error);
      showError("Failed to approve organization. Please try again.");
    }
  };

  /**
   * Handle organization KYC rejection
   * @param orgId - Organization ID (numeric)
   */
  const handleReject = async (orgId: number) => {
    try {
      const updated = await organizationRepository.update(orgId, {
        kycStatus: "REJECTED",
      });
      
      setOrganizations((prev) =>
        prev.map((org) => (org.id === orgId ? updated : org))
      );
      
      showSuccess("Organization KYC rejected");
    } catch (error) {
      console.error("Failed to reject organization:", error);
      showError("Failed to reject organization. Please try again.");
    }
  };

  const columns = getKYCColumns(documents, handleApprove, handleReject);
  const pending = organizations.filter((o) => o.kycStatus === "PENDING");

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">KYC Approvals</h1>
        <p className="text-gray-600">Review and approve organization KYC documents</p>
      </div>

      {/* Statistics */}
      <KYCStatsCard pendingCount={pending.length} />

      {/* Organizations Table */}
      <Card title="Organizations Pending Approval">
        <DataTable
          data={pending}
          columns={columns}
          emptyMessage="No organizations pending approval"
        />
      </Card>

      {/* All Organizations */}
      <Card title="All Organizations">
        <DataTable
          data={organizations}
          columns={columns}
          emptyMessage="No organizations"
        />
      </Card>
    </div>
  );
}

