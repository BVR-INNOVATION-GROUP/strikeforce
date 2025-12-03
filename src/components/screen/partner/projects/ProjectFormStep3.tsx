/**
 * Project Form Step 3 - Attachments
 */
"use client";

import React, { useRef, useState } from "react";
import FileUpload from "@/src/components/base/FileUpload";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { X, File, Upload, FileText, Image, FileSpreadsheet, FileCode, Archive } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  /**
   * Get file icon based on file type
   */
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return <Image size={20} className="text-blue-500" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText size={20} className="text-red-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet size={20} className="text-green-500" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
      return <Archive size={20} className="text-purple-500" />;
    }
    if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(ext || '')) {
      return <FileCode size={20} className="text-orange-500" />;
    }
    return <File size={20} className="text-secondary" />;
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
      
      {/* Drag and Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging 
            ? "border-primary bg-very-pale scale-[1.02]" 
            : "border-custom bg-pale hover:border-primary hover:bg-very-pale"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFileSelect(files);
          }}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`
            p-4 rounded-full transition-colors
            ${isDragging ? "bg-primary" : "bg-paper"}
          `}>
            <Upload 
              size={24} 
              className={isDragging ? "text-white" : "text-primary"} 
            />
          </div>
          <div>
            <p className="text-sm font-medium text-default mb-1">
              {isDragging ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-xs text-secondary mb-3">
              or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-medium"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-secondary">
              Accepted: PDF, Word, Excel, PowerPoint, ZIP, Images
              <br />
              Max 10MB per file • Up to 10 files
            </p>
          </div>
        </div>
      </div>

      {errors.attachments && (
        <ErrorMessage message={errors.attachments} className="mt-2" />
      )}

      {/* File List */}
      {attachments.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-default mb-3">
            {attachments.length} file{attachments.length > 1 ? "s" : ""} attached
          </p>
          <div className="space-y-2">
            <AnimatePresence>
              {attachments.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between p-3 bg-paper border border-custom rounded-lg hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-default truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-secondary">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 p-1.5 rounded hover:bg-pale transition-colors text-secondary hover:text-red-500"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFormStep3;








