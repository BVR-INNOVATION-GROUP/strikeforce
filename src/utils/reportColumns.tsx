/**
 * Report Columns Utilities
 */
import React from "react";
import { Column } from "@/src/components/base/DataTable";
import { ProjectI } from "@/src/models/project";
import StatusIndicator from "@/src/components/core/StatusIndicator";

/**
 * Get columns for project reports table
 */
export function getReportColumns(): Column<ProjectI>[] {
  return [
    {
      key: "title",
      header: "Project",
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusIndicator status={item.status} />,
    },
    {
      key: "budget",
      header: "Budget",
      render: (item) => `$${item.budget.toLocaleString()} ${item.currency}`,
    },
    {
      key: "deadline",
      header: "Deadline",
      render: (item) => new Date(item.deadline).toLocaleDateString(),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];
}






