"use client";

import React, { useEffect, useState } from "react";
import Card from "@/src/components/core/Card";
import DataTable from "@/src/components/base/DataTable";
import { OrganizationI } from "@/src/models/organization";
import { KycDocumentI } from "@/src/models/kyc";
import { getKYCColumns } from "@/src/utils/kycColumns";
import KYCStatsCard from "@/src/components/screen/super-admin/kyc/KYCStatsCard";

/**
 * Super Admin KYC Approvals - approve or reject organization KYC
 */
export default function SuperAdminKYC() {
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [documents, setDocuments] = useState<Record<string, KycDocumentI[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const orgData = await import("@/src/data/mockOrganizations.json");
        setOrganizations(orgData.default as OrganizationI[]);
        
        // Mock documents for pending organizations
        const docsMap: Record<string, KycDocumentI[]> = {};
        (orgData.default as OrganizationI[]).forEach((org) => {
          if (org.kycStatus === "PENDING") {
            docsMap[org.id] = [
              {
                id: `doc-${org.id}-1`,
                orgId: org.id,
                type: "CERTIFICATE",
                url: `/documents/${org.id}/certificate.pdf`,
                status: "PENDING",
                createdAt: "2024-01-01T10:00:00Z",
              },
            ];
          }
        });
        setDocuments(docsMap);
      } catch (error) {
        console.error("Failed to load organizations:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleApprove = (orgId: string) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId ? { ...org, kycStatus: "APPROVED" } : org
      )
    );
  };

  const handleReject = (orgId: string) => {
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId ? { ...org, kycStatus: "REJECTED" } : org
      )
    );
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

