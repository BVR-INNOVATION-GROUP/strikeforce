/**
 * Invite Acceptance Validation Utilities
 */

export interface InviteAcceptanceFormData {
  password: string;
  confirmPassword: string;
  name: string;
}

export interface ValidationErrors {
  password?: string;
  confirmPassword?: string;
  name?: string;
}

/**
 * Validate invite acceptance form
 */
export function validateInviteAcceptance(
  data: InviteAcceptanceFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Name is required (minimum 2 characters)";
  }

  return errors;
}





