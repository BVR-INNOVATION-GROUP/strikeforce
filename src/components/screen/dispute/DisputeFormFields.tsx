/**
 * Dispute Form Fields Component
 */
"use client";

import React from "react";
import Select from "@/src/components/core/Select";
import TextArea from "@/src/components/core/TextArea";
import FileUpload from "@/src/components/base/FileUpload";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { DisputeSubjectType } from "@/src/models/dispute";
import { ValidationErrors } from "@/src/utils/disputeValidation";

export interface Props {
  subjectType: DisputeSubjectType;
  subjectId: string;
  reason: string;
  description: string;
  evidenceFiles: File[];
  errors: ValidationErrors;
  onReasonChange: (reason: string) => void;
  onDescriptionChange: (description: string) => void;
  onFileSelect: (files: File[]) => void;
  onClearError: (field: string) => void;
}

/**
 * Form fields for dispute creation
 */
const DisputeFormFields = ({
  subjectType,
  subjectId,
  reason,
  description,
  evidenceFiles,
  errors,
  onReasonChange,
  onDescriptionChange,
  onFileSelect,
  onClearError,
}: Props) => {
  const reasonOptions = [
    { value: "Quality concerns", label: "Quality concerns" },
    { value: "Payment issues", label: "Payment issues" },
    { value: "Timeline disputes", label: "Timeline disputes" },
    { value: "Scope changes", label: "Scope changes" },
    { value: "Communication issues", label: "Communication issues" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-warning-dark">
          <strong>Dispute Subject:</strong> {subjectType} (ID: {subjectId})
        </p>
      </div>

      <Select
        title="Reason *"
        options={reasonOptions}
        value={reason}
        onChange={(option) => {
          const reasonValue =
            typeof option === "string" ? option : (option.value as string);
          onReasonChange(reasonValue);
          onClearError("reason");
        }}
        placeHolder="Select reason for dispute"
        error={errors.reason}
      />

      <TextArea
        title="Description *"
        value={description}
        onChange={(e) => {
          onDescriptionChange(e.target.value);
          onClearError("description");
        }}
        placeholder="Provide a detailed description of the dispute. Include relevant context, timelines, and what resolution you&apos;re seeking..."
        rows={6}
        error={errors.description}
      />

      <div>
        <p className="text-sm font-medium mb-2">Evidence (Optional)</p>
        <FileUpload
          onFileSelect={onFileSelect}
          multiple={true}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
        />
        {errors.evidence && (
          <ErrorMessage message={errors.evidence} className="mt-2" />
        )}
        {evidenceFiles.length > 0 && (
          <div className="mt-2 space-y-1">
            {evidenceFiles.map((file, index) => (
              <div
                key={index}
                className="text-xs text-secondary flex items-center justify-between p-2 bg-pale rounded"
              >
                <span>{file.name}</span>
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted mt-2">
          Upload supporting documents, screenshots, or files. Max 10MB per file,
          up to 5 files.
        </p>
      </div>

      <div className="text-sm text-secondary bg-pale-primary p-3 rounded-lg">
        <p className="font-semibold mb-1">Dispute Escalation Process:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Level 1: Student/Partner → Supervisor</li>
          <li>Level 2: Supervisor → University Admin</li>
          <li>Level 3: University Admin → Super Admin (Final)</li>
        </ul>
        <p className="mt-2 text-xs text-muted">
          Disputes are reviewed at each level before escalation. You will be
          notified at each step.
        </p>
      </div>
    </div>
  );
};

export default DisputeFormFields;






