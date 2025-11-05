/**
 * Custom hook for KYC document upload logic
 */
import { useState, useEffect } from "react";
import { KycDocumentType } from "@/src/models/kyc";
import { validateKYCForm, ValidationErrors } from "@/src/utils/kycValidation";
import { validateKYCFile, uploadKYCFile } from "@/src/utils/kycFileHandling";
import { useToast } from "@/src/hooks/useToast";

export interface UseKYCUploadResult {
  documentType: KycDocumentType | "";
  file: File | null;
  expiresAt: string;
  errors: ValidationErrors;
  uploading: boolean;
  setDocumentType: (type: KycDocumentType) => void;
  setExpiresAt: (date: string) => void;
  handleFileSelect: (files: File[]) => void;
  clearError: (field: string) => void;
  validate: () => boolean;
  uploadAndSubmit: (
    orgId: string,
    onSubmit: (document: any) => Promise<void>,
    onSuccess: () => void
  ) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing KYC document upload state and logic
 */
export function useKYCUpload(
  open: boolean
): UseKYCUploadResult {
  const [documentType, setDocumentTypeState] = useState<KycDocumentType | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [expiresAt, setExpiresAtState] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [uploading, setUploading] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      const validation = validateKYCFile(selectedFile);
      if (!validation.valid) {
        setErrors({ file: validation.error || "Invalid file" });
        setFile(null);
        return;
      }
      setFile(selectedFile);
      clearError("file");
    }
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof ValidationErrors];
      return newErrors;
    });
  };

  const validate = (): boolean => {
    const validationErrors = validateKYCForm({
      documentType,
      file,
      expiresAt,
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const uploadAndSubmit = async (
    orgId: string,
    onSubmit: (document: any) => Promise<void>,
    onSuccess: () => void
  ) => {
    if (!validate()) {
      showError("Please fix the errors before submitting");
      return;
    }

    if (!file) {
      showError("No file selected");
      return;
    }

    setUploading(true);
    try {
      const fileUrl = await uploadKYCFile(file);
      const documentData = {
        orgId,
        type: documentType as KycDocumentType,
        url: fileUrl,
        status: "PENDING",
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        createdAt: new Date().toISOString(),
      };
      await onSubmit(documentData);
      showSuccess(
        "KYC document uploaded successfully! It will be reviewed by Super Admin."
      );
      onSuccess();
    } catch (error) {
      console.error("Failed to upload document:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to upload document. Please try again."
      );
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setDocumentTypeState("");
    setFile(null);
    setExpiresAtState("");
    setErrors({});
  };

  return {
    documentType,
    file,
    expiresAt,
    errors,
    uploading,
    setDocumentType: (type) => {
      setDocumentTypeState(type);
      clearError("documentType");
    },
    setExpiresAt: (date) => {
      setExpiresAtState(date);
      clearError("expiresAt");
    },
    handleFileSelect,
    clearError,
    validate,
    uploadAndSubmit,
    reset,
  };
}





