/**
 * Screening Page Columns Configuration
 */
import React from "react";
import { Column } from "@/src/components/base/DataTable";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import Button from "@/src/components/core/Button";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { Star } from "lucide-react";

/**
 * Get columns configuration for screening data table
 */
export function getScreeningColumns(
  projects: Record<string, ProjectI>,
  onScore: (applicationId: string, score: number) => void
): Column<ApplicationI>[] {
  return [
    {
      key: "projectId",
      header: "Project",
      render: (item) => projects[item.projectId]?.title || item.projectId,
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
      key: "score",
      header: "Score",
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.score ? (
            <>
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{item.score.finalScore}</span>
              <span className="text-xs text-gray-500">
                (Auto: {item.score.autoScore})
              </span>
            </>
          ) : (
            <span className="text-gray-500">Not scored</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <Button
          onClick={() => onScore(item.id, 0)}
          className="bg-primary text-white text-xs px-3 py-1"
        >
          Score
        </Button>
      ),
    },
  ];
}





