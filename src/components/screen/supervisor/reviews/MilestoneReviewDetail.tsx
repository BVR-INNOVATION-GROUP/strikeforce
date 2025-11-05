/**
 * Milestone Review Detail Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import TextArea from "@/src/components/core/TextArea";
import Input from "@/src/components/core/Input";
import { MilestoneI } from "@/src/models/milestone";
import { CheckCircle, XCircle, FileText, AlertTriangle, TrendingUp } from "lucide-react";

export interface Props {
  milestone: MilestoneI | null;
  reviewNotes: string;
  risks: string;
  progressAdjustment: number;
  onNotesChange: (notes: string) => void;
  onRisksChange: (risks: string) => void;
  onProgressChange: (progress: number) => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  showApproveConfirm: boolean;
  showRequestChangesConfirm: boolean;
  onShowApproveConfirm: () => void;
  onShowRequestChangesConfirm: () => void;
}

/**
 * Display milestone details for review
 */
const MilestoneReviewDetail = ({
  milestone,
  reviewNotes,
  risks,
  progressAdjustment,
  onNotesChange,
  onRisksChange,
  onProgressChange,
  onApprove,
  onRequestChanges,
  showApproveConfirm,
  showRequestChangesConfirm,
  onShowApproveConfirm,
  onShowRequestChangesConfirm,
}: Props) => {
  if (!milestone) {
    return (
      <Card className="lg:col-span-2">
        <div className="text-center py-12 text-muted">
          Select a milestone to review
        </div>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">{milestone.title}</h2>
        {milestone.description && (
          <p className="text-secondary mb-4">{milestone.description}</p>
        )}
      </div>

      {milestone.submission?.workUrl && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} />
            <h3 className="font-semibold">Submitted Work</h3>
          </div>
          <a
            href={milestone.submission.workUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View submitted work
          </a>
        </div>
      )}

      {milestone.acceptanceCriteria && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Acceptance Criteria</h3>
          <p className="text-secondary">{milestone.acceptanceCriteria}</p>
        </div>
      )}

      {/* Review Notes */}
      <div className="mb-6">
        <TextArea
          title="Review Notes (Required for requesting changes)"
          value={reviewNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add notes about your review. Required when requesting changes."
          rows={4}
        />
      </div>

      {/* Risks and Concerns */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-orange-500" />
          <h3 className="font-semibold">Risks & Concerns</h3>
        </div>
        <TextArea
          value={risks}
          onChange={(e) => onRisksChange(e.target.value)}
          placeholder="Identify any risks, concerns, or issues with this milestone submission..."
          rows={3}
        />
      </div>

      {/* Progress Adjustment */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={18} className="text-primary" />
          <h3 className="font-semibold">Progress Readiness</h3>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min="0"
            max="100"
            value={progressAdjustment.toString()}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              onProgressChange(Math.min(100, Math.max(0, value)));
            }}
            placeholder="0-100"
            className="w-32"
          />
          <span className="text-sm text-secondary">% - Adjust readiness percentage</span>
        </div>
        <p className="text-xs text-secondary mt-2">
          Indicate how ready this milestone is for partner review (0-100%)
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onShowApproveConfirm}
          className="bg-primary flex-1"
          disabled={showApproveConfirm || showRequestChangesConfirm}
        >
          <CheckCircle size={16} className="mr-2" />
          Approve for Partner Review
        </Button>
        <Button
          onClick={onShowRequestChangesConfirm}
          className="bg-orange-500 text-white flex-1"
          disabled={showApproveConfirm || showRequestChangesConfirm}
        >
          <XCircle size={16} className="mr-2" />
          Request Changes
        </Button>
      </div>
    </Card>
  );
};

export default MilestoneReviewDetail;




