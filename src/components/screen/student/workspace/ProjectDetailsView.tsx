/**
 * Project Details View Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { ProjectI } from "@/src/models/project";
import { MilestoneI } from "@/src/models/milestone";
import MilestoneCard from "./MilestoneCard";

export interface Props {
  project: ProjectI | null;
  milestones: MilestoneI[];
  onMilestoneSubmit: (milestone: MilestoneI) => void;
  onMilestoneDispute: (milestone: MilestoneI) => void;
}

/**
 * Display project details and milestones
 */
const ProjectDetailsView = ({
  project,
  milestones,
  onMilestoneSubmit,
  onMilestoneDispute,
}: Props) => {
  if (!project) {
    return (
      <Card className="lg:col-span-2">
        <div className="text-center py-12 text-muted">
          Select a project to view milestones
        </div>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">{project.title}</h2>
        <p className="text-secondary mb-4">{project.description}</p>
        <div className="flex items-center gap-4">
          <StatusIndicator status={project.status} />
          <span className="text-sm text-secondary">
            Budget: ${project.budget.toLocaleString()} {project.currency}
          </span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Milestones</h3>
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              projectId={project.id}
              onSubmit={() => onMilestoneSubmit(milestone)}
              onDispute={() => onMilestoneDispute(milestone)}
            />
          ))}
          {milestones.length === 0 && (
            <p className="text-center text-muted py-8">No milestones yet</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProjectDetailsView;








