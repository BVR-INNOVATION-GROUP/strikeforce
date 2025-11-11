/**
 * KYC Form Fields Component
 */
"use client";

import React from "react";
import Select from "@/src/components/core/Select";
import FileUpload from "@/src/components/base/FileUpload";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { KycDocumentType } from "@/src/models/kyc";
import { ValidationErrors } from "@/src/utils/kycValidation";

export interface Props {
  documentType: KycDocumentType | "";
  file: File | null;
  expiresAt: string;
  errors: ValidationErrors;
  onDocumentTypeChange: (type: KycDocumentType) => void;
  onFileSelect: (files: File[]) => void;
  onExpiresAtChange: (date: string) => void;
  onClearError: (field: string) => void;
}

/**
 * Form fields for KYC document upload
 */
const KYCFormFields = ({
  documentType,
  file,
  expiresAt,
  errors,
  onDocumentTypeChange,
  onFileSelect,
  onExpiresAtChange,
  onClearError,
}: Props) => {
  const documentTypeOptions = [
    { value: "CERTIFICATE", label: "Certificate of Incorporation" },
    { value: "LICENSE", label: "Business License" },
    { value: "REGISTRATION", label: "Registration Document" },
    { value: "IDENTITY", label: "Identity Document" },
    { value: "TAX_DOCUMENT", label: "Tax Document" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Select
        title="Document Type *"
        options={documentTypeOptions}
        value={documentType}
        onChange={(option) => {
          const type =
            typeof option === "string"
              ? (option as KycDocumentType)
              : (option.value as KycDocumentType);
          onDocumentTypeChange(type);
          onClearError("documentType");
        }}
        placeHolder="Select document type"
        error={errors.documentType}
      />

      <div>
        <p className="text-sm font-medium mb-2">Upload Document *</p>
        <FileUpload
          onFileSelect={onFileSelect}
          multiple={false}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        {errors.file && <ErrorMessage message={errors.file} className="mt-2" />}
        {file && (
          <div className="mt-2 p-3 bg-pale rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">{file.name}</span>
              <span className="text-xs text-muted">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        )}
        <p className="text-xs text-muted mt-2">
          Accepted formats: PDF, JPG, PNG. Max 10MB.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-2">Expiry Date (Optional)</p>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => {
              onExpiresAtChange(e.target.value);
              onClearError("expiresAt");
            }}
            min={new Date().toISOString().split("T")[0]}
            className="w-full border p-3 border-custom rounded-lg outline-none"
          />
          {errors.expiresAt && (
            <ErrorMessage message={errors.expiresAt} className="mt-1" />
          )}
          <p className="text-xs text-muted mt-1">
            Required for documents with expiration dates
          </p>
        </div>
      </div>

      <div className="text-sm text-secondary bg-pale-primary p-3 rounded-lg">
        <p className="font-semibold mb-1">KYC Review Process:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Documents are encrypted and stored securely</li>
          <li>Super Admin will review within 2-3 business days</li>
          <li>You&apos;ll be notified when reviewed</li>
          <li>KYC approval required before funding or payouts</li>
        </ul>
      </div>
    </div>
  );
};

export default KYCFormFields;






