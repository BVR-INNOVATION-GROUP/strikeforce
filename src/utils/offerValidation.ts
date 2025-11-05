/**
 * Offer Validation Utilities
 */

export interface OfferFormData {
  expiry: string;
}

export interface ValidationErrors {
  expiry?: string;
}

/**
 * Validate offer expiry date
 */
export function validateOfferExpiry(expiry: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!expiry || expiry.trim().length === 0) {
    errors.expiry = "Offer expiry date is required";
  } else {
    const expiryDate = new Date(expiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiryDate <= today) {
      errors.expiry = "Offer expiry date must be in the future";
    }
  }

  return errors;
}





