/**
 * Milestone Proposal Validation Utilities
 */

export interface MilestoneProposalFormData {
  title: string;
  scope: string;
  acceptanceCriteria: string;
  dueDate: string;
  amount: string;
}

export interface ValidationErrors {
  title?: string;
  scope?: string;
  acceptanceCriteria?: string;
  dueDate?: string;
  amount?: string;
}

/**
 * Validate milestone proposal form
 */
export function validateMilestoneProposal(
  data: MilestoneProposalFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = "Milestone title is required";
  } else if (data.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (data.title.trim().length > 100) {
    errors.title = "Title must be less than 100 characters";
  }

  if (!data.scope || data.scope.trim().length === 0) {
    errors.scope = "Scope is required";
  } else if (data.scope.trim().length < 10) {
    errors.scope = "Scope must be at least 10 characters";
  }

  if (!data.acceptanceCriteria || data.acceptanceCriteria.trim().length === 0) {
    errors.acceptanceCriteria = "Acceptance criteria is required";
  } else if (data.acceptanceCriteria.trim().length < 10) {
    errors.acceptanceCriteria = "Acceptance criteria must be at least 10 characters";
  }

  if (!data.dueDate || data.dueDate.trim().length === 0) {
    errors.dueDate = "Due date is required";
  } else {
    const dueDateObj = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDateObj < today) {
      errors.dueDate = "Due date must be in the future";
    }
  }

  // Amount is optional, but if provided must be valid
  if (data.amount && data.amount.trim().length > 0) {
    const amountValue = parseFloat(data.amount);
    if (isNaN(amountValue) || amountValue < 0) {
      errors.amount = "Amount must be a valid positive number";
    }
  }

  return errors;
}








