/**
 * Invite Acceptance Validation Utilities
 */

export interface InviteAcceptanceFormData {
  password: string;
  confirmPassword: string;
}

export interface ValidationErrors {
  password?: string;
  confirmPassword?: string;
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

  return errors;
}






