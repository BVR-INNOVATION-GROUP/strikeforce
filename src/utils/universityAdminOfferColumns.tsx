/**
 * University Admin Offer Table Columns
 */
import React from "react";
import { Column } from "@/src/components/base/DataTable";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import Button from "@/src/components/core/Button";
import { Send, Clock, CheckCircle } from "lucide-react";

export interface GetOfferColumnsParams {
  projects: Record<string, ProjectI>;
  onIssueOffer: (application: ApplicationI) => void;
}

/**
 * Get columns for university admin offers table
 */
export function getUniversityAdminOfferColumns({
  projects,
  onIssueOffer,
}: GetOfferColumnsParams): Column<ApplicationI>[] {
  return [
    {
      key: "projectId",
      header: "Project",
      render: (item) =>
        projects[item.projectId]?.title || item.projectId,
    },
    {
      key: "applicantType",
      header: "Type",
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
      render: (item) =>
        item.offerExpiresAt
          ? new Date(item.offerExpiresAt).toLocaleDateString()
          : "-",
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          {item.status === "SHORTLISTED" && (
            <Button
              onClick={() => onIssueOffer(item)}
              className="bg-primary text-white text-xs px-3 py-1"
            >
              <Send size={12} className="mr-1" />
              Issue Offer
            </Button>
          )}
          {item.status === "OFFERED" && (
            <span className="text-xs text-yellow-600 flex items-center gap-1">
              <Clock size={12} />
              Offer Sent
            </span>
          )}
          {item.status === "ACCEPTED" && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle size={12} />
              Accepted
            </span>
          )}
        </div>
      ),
    },
  ];
}

