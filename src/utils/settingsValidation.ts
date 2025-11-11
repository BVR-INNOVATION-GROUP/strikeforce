/**
 * Settings Validation Utilities
 */

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
}

export interface ValidationErrors {
  sessionTimeout?: string;
}

/**
 * Validate settings form
 */
export function validateSettings(security: SecuritySettings): ValidationErrors {
  const errors: ValidationErrors = {};

  const timeout = parseInt(security.sessionTimeout);
  if (isNaN(timeout) || timeout < 1 || timeout > 1440) {
    errors.sessionTimeout = "Session timeout must be between 1 and 1440 minutes";
  }

  return errors;
}








