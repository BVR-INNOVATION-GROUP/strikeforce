/**
 * Dispute Validation Utilities
 */

export interface DisputeFormData {
  reason: string;
  description: string;
  evidenceFiles: File[];
}

export interface ValidationErrors {
  reason?: string;
  description?: string;
  evidence?: string;
}

/**
 * Validate dispute form fields
 */
export function validateDisputeForm(
  data: DisputeFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.reason || data.reason.trim().length === 0) {
    errors.reason = "Reason is required";
  } else if (data.reason.trim().length < 5) {
    errors.reason = "Reason must be at least 5 characters";
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = "Description is required";
  } else if (data.description.trim().length < 20) {
    errors.description = "Description must be at least 20 characters";
  } else if (data.description.trim().length > 2000) {
    errors.description = "Description must be less than 2000 characters";
  }

  if (data.evidenceFiles.length > 0) {
    if (data.evidenceFiles.length > 5) {
      errors.evidence = "Maximum 5 files allowed";
    } else {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = data.evidenceFiles.filter((f) => f.size > maxSize);
      if (oversizedFiles.length > 0) {
        errors.evidence = `Some files exceed 10MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`;
      }
    }
  }

  return errors;
}









