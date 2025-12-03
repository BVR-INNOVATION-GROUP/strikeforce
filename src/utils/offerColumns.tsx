/**
 * Offer Table Columns
 */
import React from "react";
import { Column } from "@/src/components/base/DataTable";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import Button from "@/src/components/core/Button";
import { CheckCircle, X, AlertCircle } from "lucide-react";
import Link from "next/link";

export interface GetOfferColumnsParams {
  projects: Record<string, ProjectI>;
  acceptingId: string | null;
  decliningId: string | null;
  onAccept: (application: ApplicationI) => void;
  onDecline: (application: ApplicationI) => void;
}

/**
 * Get columns for offers table
 */
export function getOfferColumns({
  projects,
  acceptingId,
  decliningId,
  onAccept,
  onDecline,
}: GetOfferColumnsParams): Column<ApplicationI>[] {
  return [
    {
      key: "projectId",
      header: "Project",
      render: (item) => (
        <Link
          href={`/student/projects/${item.projectId}`}
          className="text-primary hover:underline font-medium"
        >
          {projects[item.projectId]?.title || item.projectId}
        </Link>
      ),
    },
    {
      key: "applicantType",
      header: "Applied As",
      render: (item) => (
        <span className="capitalize">{item.applicantType.toLowerCase()}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusIndicator status={item.status} />,
    },
    {
      key: "offerExpiresAt",
      header: "Expires",
      render: (item) => {
        if (!item.offerExpiresAt) return "-";
        const expiryDate = new Date(item.offerExpiresAt);
        const now = new Date();
        const isExpired = expiryDate < now;
        return (
          <div className="flex items-center gap-2">
            <span className={isExpired ? "text-red-600" : ""}>
              {expiryDate.toLocaleDateString()}
            </span>
            {isExpired && <AlertCircle size={14} className="text-red-600" />}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => {
        const isExpired =
          item.offerExpiresAt && new Date(item.offerExpiresAt) < new Date();

        if (isExpired) {
          return <span className="text-sm text-red-600">Expired</span>;
        }

        return (
          <div className="flex gap-2">
            <Button
              onClick={() => onAccept(item)}
              className="bg-primary text-white text-xs px-3 py-1"
              disabled={acceptingId === item.id || decliningId === item.id}
            >
              <CheckCircle size={12} className="mr-1" />
              {acceptingId === item.id ? "Accepting..." : "Accept"}
            </Button>
            <Button
              onClick={() => onDecline(item)}
              className="bg-pale text-primary text-xs px-3 py-1"
              disabled={acceptingId === item.id || decliningId === item.id}
            >
              <X size={12} className="mr-1" />
              {decliningId === item.id ? "Declining..." : "Decline"}
            </Button>
          </div>
        );
      },
    },
  ];
}









