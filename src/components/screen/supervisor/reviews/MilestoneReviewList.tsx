/**
 * Milestone Review List Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { MilestoneI } from "@/src/models/milestone";
import { ProjectI } from "@/src/models/project";

export interface Props {
  milestones: MilestoneI[];
  selectedMilestone: MilestoneI | null;
  project: ProjectI | undefined;
  onSelect: (milestone: MilestoneI) => void;
}

/**
 * Display list of milestones pending review
 */
const MilestoneReviewList = ({
  milestones,
  selectedMilestone,
  project,
  onSelect,
}: Props) => {
  return (
    <Card title="Pending Reviews" className="lg:col-span-1">
      <div className="space-y-2">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            onClick={() => onSelect(milestone)}
            className={`p-3 rounded-lg cursor-pointer hover-bg-pale ${
              selectedMilestone?.id === milestone.id ? "bg-pale-primary" : ""
            }`}
          >
            <p className="font-semibold">{milestone.title}</p>
            <p className="text-sm text-secondary">{project?.title || "Project"}</p>
            <StatusIndicator status={milestone.status} className="mt-2" />
          </div>
        ))}
        {milestones.length === 0 && (
          <p className="text-center text-muted py-8">No milestones pending review</p>
        )}
      </div>
    </Card>
  );
};

export default MilestoneReviewList;






