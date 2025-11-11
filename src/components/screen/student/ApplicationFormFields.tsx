/**
 * Application Form Fields Component
 */
"use client";

import React from "react";
import Select from "@/src/components/core/Select";
import Radio from "@/src/components/core/Radio";
import RichTextEditor from "@/src/components/core/RichTextEditor";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { ApplicationType } from "@/src/models/application";
import { GroupI } from "@/src/models/group";
import Link from "next/link";
import FileUpload from "@/src/components/base/FileUpload";
import { File, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Props {
  applicantType: ApplicationType;
  selectedGroupId: string;
  statement: string;
  attachments: File[];
  availableGroups: GroupI[];
  errors: Record<string, string>;
  onApplicantTypeChange: (type: ApplicationType) => void;
  onGroupChange: (groupId: string) => void;
  onStatementChange: (value: string) => void;
  onAttachmentsChange: (files: File[]) => void;
  onClearError: (field: string) => void;
}

/**
 * Form fields for application form
 */
const ApplicationFormFields = ({
  applicantType,
  selectedGroupId,
  statement,
  attachments,
  availableGroups,
  errors,
  onApplicantTypeChange,
  onGroupChange,
  onStatementChange,
  onAttachmentsChange,
  onClearError,
}: Props) => {
  /**
   * Handle file selection
   */
  const handleFileSelect = (files: File[]) => {
    // Combine with existing files (max 5 files, 10MB each)
    const maxFiles = 5;
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
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-[12px]">Apply As *</p>
        <div className="flex flex-col gap-3">
          <Radio
            name="applicantType"
            value="INDIVIDUAL"
            checked={applicantType === "INDIVIDUAL"}
            onChange={(e) => {
              onApplicantTypeChange(e.target.value as ApplicationType);
              onClearError("applicantType");
            }}
            label="Individual"
          />
          <Radio
            name="applicantType"
            value="GROUP"
            checked={applicantType === "GROUP"}
            onChange={(e) => {
              onApplicantTypeChange(e.target.value as ApplicationType);
              onClearError("applicantType");
            }}
            label="Group"
          />
        </div>
        {errors.applicantType && <ErrorMessage message={errors.applicantType} />}
      </div>

      {applicantType === "GROUP" && (
        <div>
          {availableGroups.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-warning-dark">
                You need to be a member or leader of a group to apply as a group.
                <Link href="/student/groups" className="underline ml-1">
                  Create or join a group first.
                </Link>
              </p>
            </div>
          ) : (
            <Select
              title="Select Group *"
              options={availableGroups.map((g) => ({
                value: g.id.toString(),
                label: `${g.name} (${g.memberIds.length}/${g.capacity} members)`,
              }))}
              value={selectedGroupId || null}
              onChange={(option) => {
                const groupId =
                  typeof option === "string" ? option : (option?.value?.toString() || "");
                onGroupChange(groupId);
              }}
              placeHolder="Choose a group"
              error={errors.group}
            />
          )}
        </div>
      )}

      <div>
        <p className="mb-3 text-[12px]">Application Statement *</p>
        <RichTextEditor
          value={statement}
          onChange={onStatementChange}
          placeholder="Describe why you/your group are suitable for this project. Include relevant experience, skills, and approach..."
          error={errors.statement}
        />
      </div>

      <div>
        <p className="mb-3 text-[12px]">Attachments (CVs, Portfolios, etc.)</p>
        <FileUpload
          onFileSelect={handleFileSelect}
          multiple={true}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
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
          Upload your CV, portfolio, or other relevant documents (PDF, DOC, DOCX, TXT, JPG, PNG). Max 5 files, 10MB each.
        </p>
      </div>
    </div>
  );
};

export default ApplicationFormFields;




