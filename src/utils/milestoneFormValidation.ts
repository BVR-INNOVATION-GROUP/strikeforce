/**
 * Milestone Form Validation Utilities
 */

import { OptionI } from "@/src/components/core/Select";

export interface MilestoneFormData {
  title: string;
  dueDate: string;
  amount: string;
  currency?: OptionI | null;
}

export interface ValidationErrors {
  title?: string;
  dueDate?: string;
  amount?: string;
  currency?: string;
}

/**
 * Validate milestone form (for adding/creating milestones)
 */
export function validateMilestoneForm(
  data: MilestoneFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = "Milestone title is required";
  } else if (data.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
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

  if (!data.amount || data.amount.trim().length === 0) {
    errors.amount = "Amount is required";
  } else {
    const amountValue = parseFloat(data.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      errors.amount = "Amount must be a valid positive number";
    }
  }

  if (!data.currency) {
    errors.currency = "Currency is required";
  }

  return errors;
}



