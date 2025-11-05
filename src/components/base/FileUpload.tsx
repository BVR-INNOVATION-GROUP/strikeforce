"use client";

import React, { useRef, HTMLAttributes } from "react";
import { Upload } from "lucide-react";
import Button from "../core/Button";

export interface Props extends HTMLAttributes<HTMLInputElement> {
  onFileSelect?: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
}

/**
 * FileUpload component for file selection and upload
 */
const FileUpload = ({
  onFileSelect,
  multiple = false,
  accept,
  className = "",
  ...props
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileSelect?.(files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        {...props}
      />
      <Button onClick={handleClick} className="bg-pale text-primary">
        <div className="flex items-center gap-2">
          <Upload size={16} />
          <span>Upload Files</span>
        </div>
      </Button>
    </div>
  );
};

export default FileUpload;





