/**
 * Application Form Validation Utilities
 */
import { ApplicationType } from "@/src/models/application";

export interface ApplicationFormData {
  applicantType: ApplicationType;
  selectedGroupId: string;
  statement: string;
}

export interface ValidationErrors {
  group?: string;
  statement?: string;
}

/**
 * Validate application form fields
 */
export function validateApplicationForm(
  data: ApplicationFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (data.applicantType === "GROUP" && !data.selectedGroupId) {
    errors.group = "Please select a group";
  }

  if (!data.statement || data.statement.trim().length === 0) {
    errors.statement = "Application statement is required";
  } else if (data.statement.trim().length < 50) {
    errors.statement = "Statement must be at least 50 characters";
  } else if (data.statement.trim().length > 2000) {
    errors.statement = "Statement must be less than 2000 characters";
  }

  return errors;
}






