/**
 * Milestone Submission Details Component
 */
"use client";

import React from "react";
import { MilestoneI } from "@/src/models/milestone";

export interface Props {
  milestone: MilestoneI;
}

/**
 * Display milestone details for submission form
 */
const MilestoneSubmissionDetails = ({ milestone }: Props) => {
  return (
    <div className="bg-pale-primary p-4 rounded-lg">
      <p className="text-sm font-semibold mb-2">Milestone Details:</p>
      <ul className="text-xs space-y-1 text-secondary">
        <li>
          <strong>Scope:</strong> {milestone.scope}
        </li>
        <li>
          <strong>Acceptance Criteria:</strong> {milestone.acceptanceCriteria}
        </li>
        <li>
          <strong>Due Date:</strong> {new Date(milestone.dueDate).toLocaleDateString()}
        </li>
      </ul>
    </div>
  );
};

export default MilestoneSubmissionDetails;









