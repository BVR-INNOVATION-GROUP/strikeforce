/**
 * Invite Acceptance Validation Utilities
 */

export interface InviteAcceptanceFormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export interface ValidationErrors {
  name?: string;
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

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}






