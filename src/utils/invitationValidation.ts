/**
 * Invitation Validation Utilities
 */

export interface InvitationFormData {
  email: string;
  role: string;
  expiresInDays: string;
}

export interface ValidationErrors {
  email?: string;
  role?: string;
  expiresInDays?: string;
}

/**
 * Validate invitation form
 */
export function validateInvitationForm(
  data: InvitationFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Valid email address is required";
  }

  if (!data.role) {
    errors.role = "Role is required";
  }

  const days = parseInt(data.expiresInDays);
  if (isNaN(days) || days < 1 || days > 30) {
    errors.expiresInDays = "Expiry days must be between 1 and 30";
  }

  return errors;
}








