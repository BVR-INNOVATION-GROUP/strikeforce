/**
 * Edit Project Validation Utilities
 */

export interface EditProjectFormData {
  title: string;
  description: string;
  budget: string;
  deadline: string;
}

export interface ValidationErrors {
  title?: string;
  description?: string;
  budget?: string;
  deadline?: string;
}

/**
 * Validate edit project form
 */
export function validateEditProject(
  data: EditProjectFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = "Project title is required";
  } else if (data.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = "Description is required";
  } else if (data.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  if (!data.budget || data.budget.trim().length === 0) {
    errors.budget = "Budget is required";
  } else {
    const budgetValue = parseFloat(data.budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      errors.budget = "Budget must be a valid positive number";
    }
  }

  if (!data.deadline || data.deadline.trim().length === 0) {
    errors.deadline = "Deadline is required";
  } else {
    const deadlineDate = new Date(data.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) {
      errors.deadline = "Deadline must be in the future";
    }
  }

  return errors;
}








