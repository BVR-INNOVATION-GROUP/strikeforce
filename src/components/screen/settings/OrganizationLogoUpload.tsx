/**
 * Organization Logo Upload Component
 * Allows organization owners to upload/update their organization logo
 */
"use client";

import React, { useState, useRef } from "react";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { useAuthStore } from "@/src/store";
import { uploadOrganizationLogo } from "@/src/utils/organizationLogoUpload";
import { organizationService } from "@/src/services/organizationService";
import { Upload } from "lucide-react";
import LogoCropper from "./LogoCropper";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const OrganizationLogoUpload = () => {
  const { organization, setOrganization, user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [preview, setPreview] = useState<string | null>(
    organization?.logo ? getLogoUrl(organization.logo) : null
  );
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageForCrop, setImageForCrop] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is organization owner
  const isOrgOwner =
    user &&
    (user.role === "university-admin" || user.role === "partner") &&
    organization;

  if (!isOrgOwner) {
    return null; // Don't show for non-org owners
  }

  function getLogoUrl(path: string): string {
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}/${path}`;
  }

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

    // Read file and show cropper
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setImageForCrop(imageUrl);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    // Convert blob to file
    const file = new File([croppedImageBlob], selectedFile?.name || "logo.png", {
      type: "image/png",
    });
    setCroppedFile(file);

    // Create preview from cropped image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedImageBlob);

    // Close cropper
    setImageForCrop(null);
  };

  const handleCropCancel = () => {
    setImageForCrop(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    const fileToUpload = croppedFile || selectedFile;
    if (!fileToUpload || !organization) {
      showError("Please select and crop a file to upload");
      return;
    }

    setUploading(true);
    try {
      // Upload logo (use cropped file if available, otherwise original)
      const logoPath = await uploadOrganizationLogo(fileToUpload);

      // Refresh organization data to get updated logo
      if (organization.id) {
        const updatedOrg = await organizationService.getOrganization(
          organization.id.toString()
        );
        setOrganization(updatedOrg);
        setPreview(getLogoUrl(updatedOrg.logo || logoPath));
        showSuccess("Logo uploaded successfully!");
        setSelectedFile(null);
        setCroppedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Failed to upload logo:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to upload logo. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(organization?.logo ? getLogoUrl(organization.logo) : null);
    setSelectedFile(null);
    setCroppedFile(null);
    setImageForCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    // Note: Backend doesn't have a remove logo endpoint yet
    // For now, just clear the preview
    showError("Logo removal not yet implemented. Please contact support.");
  };

  return (
    <div className="bg-paper rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-[1rem] font-[600] mb-1">Organization Logo</h2>
        <p className="text-[0.875rem] opacity-60">
          Upload your organization logo. It will be displayed in the navigation
          for all users in your organization.
        </p>
      </div>

      <div className="flex items-start gap-6">
        {/* Logo Preview */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 border-2 border-custom rounded-lg overflow-hidden bg-pale flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Organization logo"
                className="w-full h-full object-contain"
                onError={() => {
                  setPreview(null);
                }}
              />
            ) : (
              <div className="text-center p-4">
                <Upload size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs opacity-60">No logo</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload">
              <Button
                type="button"
                className="bg-primary text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {selectedFile ? "Change File" : "Select Logo"}
              </Button>
            </label>
          </div>

          {(selectedFile || croppedFile) && (
            <div className="space-y-2">
              <p className="text-sm opacity-80">
                {croppedFile
                  ? `Ready to upload: ${croppedFile.name} (${(croppedFile.size / 1024).toFixed(2)} KB)`
                  : `Selected: ${selectedFile?.name} (${((selectedFile?.size || 0) / 1024).toFixed(2)} KB)`}
              </p>
              {!croppedFile && selectedFile && (
                <p className="text-xs text-primary">
                  Please crop the image before uploading
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleUpload}
                  className="bg-accent text-white"
                  disabled={uploading || !croppedFile}
                >
                  {uploading ? "Uploading..." : "Upload Logo"}
                </Button>
                <Button
                  type="button"
                  onClick={handleRemove}
                  className="bg-pale"
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {organization?.logo && !selectedFile && (
            <div>
              <p className="text-xs opacity-60 mb-2">
                Current logo is active. Select a new file to replace it.
              </p>
            </div>
          )}

          <div className="text-xs opacity-60">
            <p>• Supported formats: JPEG, PNG, GIF, WebP</p>
            <p>• Maximum file size: 5MB</p>
            <p>• Logo will be cropped to square format</p>
            <p>• Recommended: Upload a square image for best results</p>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      <LogoCropper
        image={imageForCrop || ""}
        open={!!imageForCrop}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </div>
  );
};

export default OrganizationLogoUpload;

