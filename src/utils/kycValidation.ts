/**
 * KYC Validation Utilities
 */
import { KycDocumentType } from "@/src/models/kyc";

export interface KYCFormData {
  documentType: KycDocumentType | "";
  file: File | null;
  expiresAt: string;
}

export interface ValidationErrors {
  documentType?: string;
  file?: string;
  expiresAt?: string;
}

/**
 * Validate KYC form fields
 */
export function validateKYCForm(data: KYCFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.documentType) {
    errors.documentType = "Document type is required";
  }

  if (!data.file) {
    errors.file = "File is required";
  }

  if (data.expiresAt) {
    const expiryDate = new Date(data.expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiryDate < today) {
      errors.expiresAt = "Expiry date must be in the future";
    }
  }

  return errors;
}





