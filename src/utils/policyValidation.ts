/**
 * Policy Validation Utilities
 */

export interface PolicyFormData {
  supervisorMaxActive: number;
  payoutRouting: string;
  autoShortlistThreshold: number;
  offerExpiryDays: number;
}

export interface ValidationErrors {
  supervisorMaxActive?: string;
  autoShortlistThreshold?: string;
  offerExpiryDays?: string;
}

/**
 * Validate policy form fields
 */
export function validatePolicies(
  policies: PolicyFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (policies.supervisorMaxActive < 1 || policies.supervisorMaxActive > 50) {
    errors.supervisorMaxActive =
      "Supervisor max active must be between 1 and 50";
  }

  if (
    policies.autoShortlistThreshold < 0 ||
    policies.autoShortlistThreshold > 100
  ) {
    errors.autoShortlistThreshold =
      "Auto-shortlist threshold must be between 0 and 100";
  }

  if (policies.offerExpiryDays < 1 || policies.offerExpiryDays > 30) {
    errors.offerExpiryDays = "Offer expiry days must be between 1 and 30";
  }

  return errors;
}





