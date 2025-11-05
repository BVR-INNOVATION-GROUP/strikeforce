/**
 * Edit Project Form Fields Component
 */
"use client";

import React from "react";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import { ValidationErrors } from "@/src/utils/editProjectValidation";

export interface Props {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  errors: ValidationErrors;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onBudgetChange: (budget: string) => void;
  onDeadlineChange: (deadline: string) => void;
  onClearError: (field: string) => void;
}

/**
 * Form fields for editing project
 */
const EditProjectFormFields = ({
  title,
  description,
  budget,
  deadline,
  errors,
  onTitleChange,
  onDescriptionChange,
  onBudgetChange,
  onDeadlineChange,
  onClearError,
}: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <Input
        title="Project Title"
        value={title}
        onChange={(e) => {
          onTitleChange(e.target.value);
          onClearError("title");
        }}
        error={errors.title}
      />
      <TextArea
        title="Description"
        value={description}
        onChange={(e) => {
          onDescriptionChange(e.target.value);
          onClearError("description");
        }}
        rows={6}
        error={errors.description}
      />
      <Input
        title="Budget"
        type="number"
        value={budget}
        onChange={(e) => {
          onBudgetChange(e.target.value);
          onClearError("budget");
        }}
        min="0"
        step="0.01"
        error={errors.budget}
      />
      <Input
        title="Deadline"
        type="date"
        value={deadline}
        onChange={(e) => {
          onDeadlineChange(e.target.value);
          onClearError("deadline");
        }}
        min={new Date().toISOString().split("T")[0]}
        error={errors.deadline}
      />
    </div>
  );
};

export default EditProjectFormFields;





