/**
 * Project Header Component
 */
"use client";

import React from "react";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { ProjectI } from "@/src/models/project";
import { ApplicationI } from "@/src/models/application";
import { Briefcase } from "lucide-react";

export interface Props {
  project: ProjectI;
  hasApplied: boolean;
  existingApplication: ApplicationI | null;
  onApply: () => void;
}

/**
 * Display project header with apply button or application status
 */
const ProjectHeader = ({
  project,
  hasApplied,
  existingApplication,
  onApply,
}: Props) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <div className="flex items-center gap-4 text-sm text-secondary">
          <StatusIndicator status={project.status} />
          <span>
            Budget: ${project.budget.toLocaleString()} {project.currency}
          </span>
        </div>
      </div>
      {!hasApplied && project.status === "published" && (
        <Button onClick={onApply} className="bg-primary">
          <Briefcase size={16} className="mr-2" />
          Apply Now
        </Button>
      )}
      {hasApplied && existingApplication && (
        <div className="px-4 py-2 bg-pale-primary rounded-lg">
          <p className="text-sm font-medium text-primary">
            Application Submitted
          </p>
          <StatusIndicator status={existingApplication.status} className="mt-1" />
        </div>
      )}
    </div>
  );
};

export default ProjectHeader;






