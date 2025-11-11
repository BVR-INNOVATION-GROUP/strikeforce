/**
 * Project Form Step 3 - Attachments
 */
"use client";

import React from "react";
import FileUpload from "@/src/components/base/FileUpload";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { X, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Props {
  attachments: File[];
  errors: Record<string, string>;
  onAttachmentsChange: (files: File[]) => void;
  onClearError: (field: string) => void;
}

/**
 * Step 3 of project form - attachments
 */
const ProjectFormStep3 = ({
  attachments,
  errors,
  onAttachmentsChange,
  onClearError,
}: Props) => {
  /**
   * Handle file selection
   */
  const handleFileSelect = (files: File[]) => {
    // Combine with existing files (max 10 files, 10MB each)
    const maxFiles = 10;
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const validFiles = files.filter((file) => {
      if (file.size > maxSizeBytes) {
        return false;
      }
      return true;
    });

    const combined = [...attachments, ...validFiles].slice(0, maxFiles);
    onAttachmentsChange(combined);
    onClearError("attachments");
  };

  /**
   * Remove a file
   */
  const removeFile = (index: number) => {
    const newFiles = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(newFiles);
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div>
      <p className="mb-3 text-[12px]">Project Attachments</p>
      <FileUpload
        onFileSelect={handleFileSelect}
        multiple={true}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif"
      />
      {errors.attachments && (
        <ErrorMessage message={errors.attachments} className="mt-2" />
      )}

      {/* File List */}
      {attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs opacity-60 mb-2">
            {attachments.length} file{attachments.length > 1 ? "s" : ""}{" "}
            attached
          </p>
          <div className="space-y-2">
            <AnimatePresence>
              {attachments.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between p-3 bg-pale rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File size={16} opacity={0.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{file.name}</p>
                      <p className="text-xs opacity-50">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 p-1 rounded hover:bg-very-pale transition-colors"
                  >
                    <X size={16} opacity={0.7} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs opacity-50 mt-3">
        Accepted formats: PDF, Word, Excel, PowerPoint, ZIP, Images. Max 10MB
        per file. Up to 10 files.
      </p>
    </div>
  );
};

export default ProjectFormStep3;







