/**
 * Organization Signup Validation Utilities
 */

export interface OrganizationSignupFormData {
  orgName: string;
  email: string;
  contactName: string;
  phone: string;
  address: string;
  website: string;
  description: string;
}

export interface ValidationErrors {
  orgName?: string;
  email?: string;
  contactName?: string;
  phone?: string;
  address?: string;
}

/**
 * Validate organization signup form
 */
export function validateOrganizationSignup(
  data: OrganizationSignupFormData,
  isUniversity: boolean = false
): ValidationErrors {
  const errors: ValidationErrors = {};

  const orgTypeName = isUniversity ? "University name" : "Organization name";
  if (!data.orgName || data.orgName.trim().length < 2) {
    errors.orgName = `${orgTypeName} is required (minimum 2 characters)`;
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Valid email address is required";
  }

  if (!data.contactName || data.contactName.trim().length < 2) {
    errors.contactName = "Contact name is required";
  }

  if (!data.phone || data.phone.trim().length < 10) {
    errors.phone = "Valid phone number is required";
  }

  if (!data.address || data.address.trim().length < 5) {
    errors.address = "Address is required";
  }

  return errors;
}





