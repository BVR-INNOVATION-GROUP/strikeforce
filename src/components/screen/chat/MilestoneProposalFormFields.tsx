/**
 * Milestone Proposal Form Fields Component
 */
"use client";

import React from "react";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import { ValidationErrors } from "@/src/utils/milestoneProposalValidation";

export interface Props {
  title: string;
  scope: string;
  acceptanceCriteria: string;
  dueDate: string;
  amount: string;
  errors: ValidationErrors;
  onTitleChange: (title: string) => void;
  onScopeChange: (scope: string) => void;
  onAcceptanceCriteriaChange: (criteria: string) => void;
  onDueDateChange: (date: string) => void;
  onAmountChange: (amount: string) => void;
  onClearError: (field: string) => void;
}

/**
 * Form fields for milestone proposal
 */
const MilestoneProposalFormFields = ({
  title,
  scope,
  acceptanceCriteria,
  dueDate,
  amount,
  errors,
  onTitleChange,
  onScopeChange,
  onAcceptanceCriteriaChange,
  onDueDateChange,
  onAmountChange,
  onClearError,
}: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <Input
        title="Milestone Title *"
        value={title}
        onChange={(e) => {
          onTitleChange(e.target.value);
          onClearError("title");
        }}
        placeholder="e.g., Design System & Wireframes"
        error={errors.title}
      />

      <TextArea
        title="Scope *"
        value={scope}
        onChange={(e) => {
          onScopeChange(e.target.value);
          onClearError("scope");
        }}
        placeholder="Describe what work will be done in this milestone..."
        rows={4}
        error={errors.scope}
      />

      <TextArea
        title="Acceptance Criteria *"
        value={acceptanceCriteria}
        onChange={(e) => {
          onAcceptanceCriteriaChange(e.target.value);
          onClearError("acceptanceCriteria");
        }}
        placeholder="List the specific criteria that must be met for this milestone to be considered complete..."
        rows={4}
        error={errors.acceptanceCriteria}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          title="Due Date *"
          type="date"
          value={dueDate}
          onChange={(e) => {
            onDueDateChange(e.target.value);
            onClearError("dueDate");
          }}
          min={new Date().toISOString().split("T")[0]}
          error={errors.dueDate}
        />

        <Input
          title="Amount (Optional)"
          type="number"
          value={amount}
          onChange={(e) => {
            onAmountChange(e.target.value);
            onClearError("amount");
          }}
          placeholder="0.00"
          min="0"
          step="0.01"
          error={errors.amount}
        />
      </div>

      <div className="text-sm text-secondary bg-pale-primary p-3 rounded-lg">
        <p className="font-semibold mb-1">Proposal Workflow:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Proposal will be sent to all project participants</li>
          <li>Students/Group can accept the proposal</li>
          <li>Partner finalizes to create the milestone</li>
          <li>Escrow funding required before starting work</li>
        </ul>
      </div>
    </div>
  );
};

export default MilestoneProposalFormFields;






