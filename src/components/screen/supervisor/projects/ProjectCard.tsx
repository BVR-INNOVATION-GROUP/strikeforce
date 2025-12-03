/**
 * Supervisor Project Card Component
 */
"use client";

import React from "react";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { ProjectI } from "@/src/models/project";
import { MilestoneI } from "@/src/models/milestone";
import Link from "next/link";

export interface Props {
  project: ProjectI;
  milestones: MilestoneI[];
}

/**
 * Display a single supervised project card
 */
const ProjectCard = ({ project, milestones }: Props) => {
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const pendingMilestones = projectMilestones.filter(
    (m) => m.status === "SUBMITTED" || m.status === "SUPERVISOR_REVIEW"
  );

  return (
    <div className="p-4 bg-pale rounded-lg border border-custom">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{project.title}</h3>
          <p className="text-sm text-secondary mt-1">
            {project.description.substring(0, 100)}...
          </p>
        </div>
        <StatusIndicator status={project.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-secondary">Budget</p>
          <p className="font-semibold">
            ${project.budget.toLocaleString()} {project.currency}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">Deadline</p>
          <p className="font-semibold">
            {new Date(project.deadline).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">Milestones</p>
          <p className="font-semibold">{projectMilestones.length}</p>
        </div>
        <div>
          <p className="text-xs text-secondary">Pending Review</p>
          <p className="font-semibold text-warning">
            {pendingMilestones.length}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/supervisor/projects/${project.id}`}>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm">
            View Details
          </button>
        </Link>
        {pendingMilestones.length > 0 && (
          <Link href={`/supervisor/reviews?project=${project.id}`}>
            <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm">
              Review Milestones ({pendingMilestones.length})
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;









