/**
 * Logo Upload Component
 * Handles organization logo upload with preview
 */
"use client";

import React, { useState, useRef } from "react";
import { uploadOrganizationLogo } from "@/src/utils/organizationLogoUpload";
import { useToast } from "@/src/hooks/useToast";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { BASE_URL } from "@/src/api/client";

export interface LogoUploadProps {
  onLogoChange: (logoPath: string) => void;
  onFileChange?: (file: File | null) => void;
  currentLogo?: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ onLogoChange, onFileChange, currentLogo }) => {
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError, showSuccess } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showError("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("File size exceeds 5MB limit");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store file for later upload (after org creation)
    setSelectedFile(file);
    onFileChange?.(file);
    setUploading(false);
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    onFileChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onLogoChange("");
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 border-2 border-custom rounded-lg overflow-hidden bg-very-pale">
            <img
              src={preview.startsWith("data:") ? preview : getImageUrl(preview)}
              alt="Logo preview"
              className="w-full h-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-32 h-32 border-2 border-dashed border-custom rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover-bg-very-pale transition-colors"
        >
          <ImageIcon size={32} className="text-muted-light mb-2" />
          <p className="text-xs text-muted text-center px-2">Click to upload</p>
          <p className="text-xs text-muted-light mt-1">Max 5MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {!preview && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-default bg-paper border border-custom rounded-lg hover-bg-very-pale disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={16} />
          {uploading ? "Uploading..." : "Choose Logo"}
        </button>
      )}

      <p className="text-xs text-muted">
        Recommended: Square image, at least 200x200px. Formats: JPEG, PNG, GIF, WebP
      </p>
    </div>
  );
};

export default LogoUpload;

