/**
 * Add Milestone Form Fields Component
 */
"use client";

import React from "react";
import Input from "@/src/components/core/Input";
import RichTextEditor from "@/src/components/core/RichTextEditor";
import DatePicker from "@/src/components/base/DatePicker";
import MergedCurrencyInput from "@/src/components/base/MergedCurrencyInput";
import { OptionI } from "@/src/components/core/Select";
import { ValidationErrors } from "@/src/utils/milestoneFormValidation";

export interface Props {
  title: string;
  scope: string;
  dueDate: string;
  amount: string;
  currency: OptionI | null;
  errors: ValidationErrors;
  onTitleChange: (title: string) => void;
  onScopeChange: (scope: string) => void;
  onDueDateChange: (date: string) => void;
  onAmountChange: (amount: string) => void;
  onCurrencyChange: (currency: OptionI | string) => void;
  onClearError: (field: keyof ValidationErrors) => void;
}

/**
 * Form fields for adding milestone
 */
const AddMilestoneFormFields = ({
  title,
  scope,
  dueDate,
  amount,
  currency,
  errors,
  onTitleChange,
  onScopeChange,
  onDueDateChange,
  onAmountChange,
  onCurrencyChange,
  onClearError,
}: Props) => {

  return (
    <div className="flex flex-col gap-4">
      <Input
        title="Milestone Title *"
        value={title}
        onChange={(e) => {
          onTitleChange(e.target.value);
          onClearError("title" as keyof ValidationErrors);
        }}
        onKeyDown={(e) => {
          // Prevent Enter key from submitting form
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        placeholder="e.g., Design System & Wireframes"
        error={errors.title}
      />
      <RichTextEditor

        value={scope}
        onChange={onScopeChange}
        placeholder="Describe the milestone scope..."

      />
      <DatePicker
        title="Due Date *"
        value={dueDate}
        onChange={(value) => {
          onDueDateChange(value);
          onClearError("dueDate" as keyof ValidationErrors);
        }}
        min={new Date().toISOString().split("T")[0]}
        error={errors.dueDate}
        placeholder="Select due date"
        onClearError={() => onClearError("dueDate" as keyof ValidationErrors)}
      />
      <MergedCurrencyInput
        title="Amount *"
        currency={currency}
        amount={amount}
        onCurrencyChange={(value) => {
          onCurrencyChange(value);
          onClearError("currency" as keyof ValidationErrors);
        }}
        onAmountChange={(value) => {
          onAmountChange(value);
          onClearError("amount" as keyof ValidationErrors);
        }}
        currencyError={errors.currency}
        amountError={errors.amount}
        onClearError={(field) => onClearError(field as keyof ValidationErrors)}
        placeholder="0.00"
      />
    </div>
  );
};

export default AddMilestoneFormFields;

