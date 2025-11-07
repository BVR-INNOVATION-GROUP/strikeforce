/**
 * Submission File List Component
 */
"use client";

import React from "react";
import FileUpload from "@/src/components/base/FileUpload";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { ValidationErrors } from "@/src/utils/milestoneSubmissionValidation";

export interface Props {
  files: File[];
  errors: ValidationErrors;
  onFileSelect: (files: File[]) => void;
  onClearError: () => void;
}

/**
 * File upload and list display for milestone submission
 */
const SubmissionFileList = ({ files, errors, onFileSelect, onClearError }: Props) => {
  return (
    <div>
      <p className="text-sm font-medium mb-2">Upload Deliverables *</p>
      <FileUpload
        onFileSelect={(selectedFiles) => {
          onFileSelect(selectedFiles);
          onClearError();
        }}
        multiple={true}
        accept=".pdf,.doc,.docx,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif"
      />
      {errors.files && <ErrorMessage message={errors.files} className="mt-2" />}
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((file, index) => (
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
        Accepted formats: PDF, Word, ZIP, Images. Max 10MB per file. Up to 10 files.
      </p>
    </div>
  );
};

export default SubmissionFileList;






