/**
 * Project Form Step 2 - Project Details (Title, Description, Budget, etc.)
 */
"use client";

import React from "react";
import Input from "@/src/components/core/Input";
import RichTextEditor from "@/src/components/core/RichTextEditor";
import MergedCurrencyInput from "@/src/components/base/MergedCurrencyInput";
import DatePicker from "@/src/components/base/DatePicker";
import Select from "@/src/components/core/Select";
import { OptionI } from "@/src/components/core/Select";

export interface Props {
  title: string;
  desc: string; // Kept for backward compatibility
  summary: string;
  challengeStatement: string;
  scopeActivities: string;
  teamStructure: "individuals" | "groups" | "both" | "";
  duration: string;
  durationValue: string;
  durationUnit: "day" | "week" | "month" | "";
  expectations: string;
  budget: string;
  deadline: string;
  capacity: string;
  currency: OptionI | null;
  errors: Record<string, string>;
  onTitleChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onChallengeStatementChange: (value: string) => void;
  onScopeActivitiesChange: (value: string) => void;
  onTeamStructureChange: (value: "individuals" | "groups" | "both" | "") => void;
  onDurationChange: (value: string) => void;
  onDurationValueChange: (value: string) => void;
  onDurationUnitChange: (value: "day" | "week" | "month" | "") => void;
  onExpectationsChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onDeadlineChange: (value: string) => void;
  onCapacityChange: (value: string) => void;
  onCurrencyChange: (value: OptionI | string) => void;
  onClearError: (field: string) => void;
}

/**
 * Step 2 of project form - project details
 */
const ProjectFormStep2 = ({
  title,
  desc,
  summary,
  challengeStatement,
  scopeActivities,
  teamStructure,
  duration,
  durationValue,
  durationUnit,
  expectations,
  budget,
  deadline,
  capacity,
  currency,
  errors,
  onTitleChange,
  onDescChange,
  onSummaryChange,
  onChallengeStatementChange,
  onScopeActivitiesChange,
  onTeamStructureChange,
  onDurationChange,
  onDurationValueChange,
  onDurationUnitChange,
  onExpectationsChange,
  onBudgetChange,
  onDeadlineChange,
  onCapacityChange,
  onCurrencyChange,
  onClearError,
}: Props) => {
  const teamStructureOptions: OptionI[] = [
    { value: "individuals", label: "Individuals" },
    { value: "groups", label: "Groups" },
    { value: "both", label: "Both" },
  ];

  return (
    <>
      <Input
        title="Project Title *"
        value={title}
        onChange={(e) => {
          onTitleChange(e.target.value);
          onClearError("title");
        }}
        placeholder="Enter project title"
        error={errors.title}
      />
      <RichTextEditor
        title="Project Summary *"
        value={summary}
        onChange={onSummaryChange}
        placeholder="Provide a brief overview of the project..."
        rows={3}
        error={errors.summary}
      />
      <RichTextEditor
        title="Project Challenge/Opportunity Statement *"
        value={challengeStatement}
        onChange={onChallengeStatementChange}
        placeholder="Describe the problem or opportunity this project addresses..."
        rows={4}
        error={errors.challengeStatement}
      />
      <RichTextEditor
        title="Project Scope/Activities *"
        value={scopeActivities}
        onChange={onScopeActivitiesChange}
        placeholder="Describe what students must work on, including specific tasks and activities..."
        rows={4}
        error={errors.scopeActivities}
      />
      <Select
        title="Allowed Team Structure *"
        options={teamStructureOptions}
        value={teamStructure || null}
        onChange={(value) => {
          const val = typeof value === "string" ? value : value.value;
          onTeamStructureChange(val as "individuals" | "groups" | "both" | "");
          onClearError("teamStructure");
        }}
        placeHolder="Select team structure"
        error={errors.teamStructure}
      />
      <div>
        <p className="text-sm font-medium mb-2">Project Duration *</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              value={durationValue}
              onChange={(e) => {
                onDurationValueChange(e.target.value);
                onClearError("duration");
              }}
              placeholder="e.g., 12"
              min="1"
              error={errors.duration}
            />
          </div>
          <div className="flex-1">
            <Select
              options={[
                { value: "day", label: "Day(s)" },
                { value: "week", label: "Week(s)" },
                { value: "month", label: "Month(s)" },
              ]}
              value={durationUnit || null}
              onChange={(value) => {
                const val = typeof value === "string" ? value : value?.value || "";
                onDurationUnitChange(val as "day" | "week" | "month" | "");
                onClearError("duration");
              }}
              placeHolder="Select unit"
              error={errors.duration}
            />
          </div>
        </div>
      </div>
      <RichTextEditor
        title="Expectations *"
        value={expectations}
        onChange={onExpectationsChange}
        placeholder="Describe expectations for students, deliverables quality, communication, etc..."
        rows={4}
        error={errors.expectations}
      />
      <MergedCurrencyInput
        title="Budget *"
        currency={currency}
        amount={budget}
        onCurrencyChange={(value) => {
          onCurrencyChange(value);
          onClearError("currency");
        }}
        onAmountChange={(value) => {
          onBudgetChange(value);
          onClearError("budget");
        }}
        currencyError={errors.currency}
        amountError={errors.budget}
        onClearError={onClearError}
        placeholder="0.00"
      />
      <div className="flex gap-2">
        <div className="flex-1">
          <DatePicker
            title="Deadline *"
            value={deadline}
            onChange={(value) => {
              onDeadlineChange(value);
              onClearError("deadline");
            }}
            min={new Date().toISOString().split("T")[0]}
            error={errors.deadline}
            placeholder="Select deadline"
            onClearError={onClearError}
          />
        </div>
        <div className="flex-1">
          <Input
            title="Capacity*"
            type="number"
            value={capacity}
            onChange={(e) => {
              onCapacityChange(e.target.value);
              onClearError("capacity");
            }}
            placeholder="1"
            min="1"
            error={errors.capacity}
          />
        </div>
      </div>
    </>
  );
};

export default ProjectFormStep2;


