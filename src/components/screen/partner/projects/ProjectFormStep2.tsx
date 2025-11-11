/**
 * Project Form Step 2 - Project Details (Title, Description, Budget, etc.)
 */
"use client";

import React from "react";
import Input from "@/src/components/core/Input";
import RichTextEditor from "@/src/components/core/RichTextEditor";
import CurrencyInput from "@/src/components/base/CurrencyInput";
import DatePicker from "@/src/components/base/DatePicker";
import { OptionI } from "@/src/components/core/Select";

export interface Props {
  title: string;
  desc: string;
  budget: string;
  deadline: string;
  capacity: string;
  currency: OptionI | null;
  errors: Record<string, string>;
  onTitleChange: (value: string) => void;
  onDescChange: (value: string) => void;
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
  budget,
  deadline,
  capacity,
  currency,
  errors,
  onTitleChange,
  onDescChange,
  onBudgetChange,
  onDeadlineChange,
  onCapacityChange,
  onCurrencyChange,
  onClearError,
}: Props) => {
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
        title="Description *"
        value={desc}
        onChange={onDescChange}
        placeholder="Describe the project requirements, scope, and deliverables..."
        rows={6}
        error={errors.desc}
      />
      <CurrencyInput
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


