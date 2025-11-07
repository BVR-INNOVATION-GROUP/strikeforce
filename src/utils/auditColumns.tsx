/**
 * Audit Columns Configuration
 */
import React from "react";
import { Column } from "@/src/components/base/DataTable";
import StatusIndicator from "@/src/components/core/StatusIndicator";

export interface AuditEventI {
  id: string;
  type: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  details?: string;
}

/**
 * Get columns configuration for audit events data table
 */
export function getAuditColumns(): Column<AuditEventI>[] {
  return [
    {
      key: "type",
      header: "Event Type",
      render: (item) => (
        <span className="capitalize">{item.type.replace("_", " ").toLowerCase()}</span>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (item) => <StatusIndicator status={item.action} label={item.action} />,
    },
    {
      key: "target",
      header: "Target",
    },
    {
      key: "timestamp",
      header: "Timestamp",
      render: (item) => new Date(item.timestamp).toLocaleString(),
    },
    {
      key: "details",
      header: "Details",
    },
  ];
}






