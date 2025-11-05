/**
 * KYC Columns Configuration
 */
import React from "react";
import { Column } from "@/src/components/base/DataTable";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import Button from "@/src/components/core/Button";
import { OrganizationI } from "@/src/models/organization";
import { KycDocumentI } from "@/src/models/kyc";
import { ShieldCheck, XCircle, FileText } from "lucide-react";

/**
 * Get columns configuration for KYC approvals data table
 */
export function getKYCColumns(
  documents: Record<string, KycDocumentI[]>,
  onApprove: (orgId: string) => void,
  onReject: (orgId: string) => void
): Column<OrganizationI>[] {
  return [
    {
      key: "name",
      header: "Organization",
    },
    {
      key: "type",
      header: "Type",
      render: (item) => (
        <span className="capitalize">{item.type.toLowerCase()}</span>
      ),
    },
    {
      key: "kycStatus",
      header: "Status",
      render: (item) => <StatusIndicator status={item.kycStatus} />,
    },
    {
      key: "createdAt",
      header: "Submitted",
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          {item.kycStatus === "PENDING" && (
            <>
              <Button
                onClick={() => onApprove(item.id)}
                className="bg-green-500 text-white text-xs px-3 py-1"
              >
                <ShieldCheck size={12} className="mr-1" />
                Approve
              </Button>
              <Button
                onClick={() => onReject(item.id)}
                className="bg-red-500 text-white text-xs px-3 py-1"
              >
                <XCircle size={12} className="mr-1" />
                Reject
              </Button>
            </>
          )}
          {documents[item.id] && documents[item.id].length > 0 && (
            <Button className="bg-pale text-primary text-xs px-3 py-1">
              <FileText size={12} className="mr-1" />
              View Docs
            </Button>
          )}
        </div>
      ),
    },
  ];
}





