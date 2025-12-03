/**
 * Milestone Submission Validation Utilities
 */

export interface MilestoneSubmissionFormData {
  notes: string;
  files: File[];
}

export interface ValidationErrors {
  notes?: string;
  files?: string;
}

/**
 * Validate milestone submission form
 */
export function validateMilestoneSubmission(
  data: MilestoneSubmissionFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (data.files.length === 0) {
    errors.files = "At least one file is required";
  } else if (data.files.length > 10) {
    errors.files = "Maximum 10 files allowed";
  } else {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = data.files.filter((f) => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      errors.files = `Some files exceed 10MB limit: ${oversizedFiles
        .map((f) => f.name)
        .join(", ")}`;
    }
  }

  if (!data.notes || data.notes.trim().length === 0) {
    errors.notes = "Submission notes are required";
  } else if (data.notes.trim().length < 10) {
    errors.notes = "Notes must be at least 10 characters";
  } else if (data.notes.trim().length > 2000) {
    errors.notes = "Notes must be less than 2000 characters";
  }

  return errors;
}









