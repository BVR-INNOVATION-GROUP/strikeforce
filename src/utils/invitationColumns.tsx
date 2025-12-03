/**
 * Invitation Columns Configuration
 */
import React from "react";
import { Column } from "@/src/components/base/DataTable";
import { InvitationI, InvitationStatus } from "@/src/models/invitation";
import { Clock, CheckCircle, X } from "lucide-react";

/**
 * Get status badge for invitation
 */
function getStatusBadge(status: InvitationStatus) {
  switch (status) {
    case "PENDING":
      return (
        <span className="flex items-center gap-1 text-warning">
          <Clock size={14} />
          Pending
        </span>
      );
    case "USED":
      return (
        <span className="flex items-center gap-1 text-success">
          <CheckCircle size={14} />
          Used
        </span>
      );
    case "EXPIRED":
      return (
        <span className="flex items-center gap-1 text-error">
          <X size={14} />
          Expired
        </span>
      );
  }
}

/**
 * Get columns configuration for invitations data table
 */
export function getInvitationColumns(): Column<InvitationI>[] {
  return [
    {
      key: "email",
      header: "Email",
      render: (item) => <span className="font-medium">{item.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (item) => <span className="capitalize">{item.role}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const isExpired = new Date(item.expiresAt) < new Date();
        const displayStatus = isExpired ? "EXPIRED" : item.status;
        return getStatusBadge(displayStatus as InvitationStatus);
      },
    },
    {
      key: "expiresAt",
      header: "Expires",
      render: (item) => (
        <span className="text-sm text-secondary">
          {new Date(item.expiresAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (item) => (
        <span className="text-sm text-secondary">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];
}









