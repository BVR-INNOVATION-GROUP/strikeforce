/**
 * Supervisor Request Validation Utilities
 */

export interface SupervisorRequestFormData {
  projectId: string;
  supervisorId: string;
}

export interface ValidationErrors {
  project?: string;
  supervisor?: string;
}

/**
 * Validate supervisor request form
 */
export function validateSupervisorRequest(
  data: SupervisorRequestFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.projectId) {
    errors.project = "Please select a project";
  }

  if (!data.supervisorId) {
    errors.supervisor = "Please select a supervisor";
  }

  return errors;
}









