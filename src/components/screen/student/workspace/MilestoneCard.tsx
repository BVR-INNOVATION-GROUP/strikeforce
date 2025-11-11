/**
 * Milestone Card Component
 */
"use client";

import React from "react";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import Button from "@/src/components/core/Button";
import Link from "next/link";
import { FileText, CheckCircle, Clock, DollarSign, Upload, AlertCircle } from "lucide-react";
import { MilestoneI } from "@/src/models/milestone";
import { submissionService } from "@/src/services/submissionService";

export interface Props {
  milestone: MilestoneI;
  projectId: string;
  onSubmit: () => void;
  onDispute: () => void;
}

/**
 * Display a milestone card with details and actions
 */
const MilestoneCard = ({
  milestone,
  projectId,
  onSubmit,
  onDispute,
}: Props) => {
  const canDispute =
    milestone.status === "IN_PROGRESS" ||
    milestone.status === "SUBMITTED" ||
    milestone.status === "SUPERVISOR_REVIEW" ||
    milestone.status === "PARTNER_REVIEW" ||
    milestone.status === "CHANGES_REQUESTED";

  return (
    <div className="p-4 bg-pale rounded-lg border border-custom">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold">{milestone.title}</h4>
          <p className="text-sm text-secondary mt-1">{milestone.scope}</p>
        </div>
        <StatusIndicator status={milestone.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-muted" />
          <div>
            <p className="text-xs text-secondary">Due Date</p>
            <p className="text-sm font-medium">
              {new Date(milestone.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-muted" />
          <div>
            <p className="text-xs text-secondary">Amount</p>
            <p className="text-sm font-medium">
              ${milestone.amount.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-muted" />
          <div>
            <p className="text-xs text-secondary">Status</p>
            <p className="text-sm font-medium capitalize">
              {milestone.status.replace("_", " ").toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-muted" />
          <div>
            <p className="text-xs text-secondary">Escrow</p>
            <p className="text-sm font-medium capitalize">
              {milestone.escrowStatus.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href={`/student/workspace/${projectId}/milestones/${milestone.id}`}>
          <Button className="bg-primary text-white">View Details</Button>
        </Link>
        {submissionService.canSubmit(milestone) && (
          <Button onClick={onSubmit} className="bg-green-500 text-white">
            <Upload size={14} className="mr-1" />
            Submit Work
          </Button>
        )}
        {canDispute && (
          <Button onClick={onDispute} className="bg-red-500 text-white">
            <AlertCircle size={14} className="mr-1" />
            Raise Dispute
          </Button>
        )}
      </div>
    </div>
  );
};

export default MilestoneCard;








