/**
 * Project Form Validation Utilities
 */
import { OptionI } from "@/src/components/core/Select";

export interface ValidationErrors {
  university?: string;
  department?: string;
  course?: string;
  skills?: string;
  title?: string;
  desc?: string;
  currency?: string;
  budget?: string;
  deadline?: string;
  capacity?: string;
}

/**
 * Validate Step 1 fields (University, Department, Course, Skills)
 */
export function validateStep1(
  university: OptionI | undefined,
  department: OptionI | null,
  course: OptionI | null,
  selectedSkills: string[]
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!university) {
    errors.university = "University is required";
  }
  if (!department) {
    errors.department = "Department is required";
  }
  if (!course) {
    errors.course = "Course is required";
  }
  if (selectedSkills.length === 0) {
    errors.skills = "At least one skill is required";
  }

  return errors;
}

/**
 * Validate Step 2 fields (Title, Description, Budget, etc.)
 */
export function validateStep2(
  title: string,
  desc: string,
  currency: OptionI | null,
  budget: string,
  deadline: string,
  capacity: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!title || title.trim().length === 0) {
    errors.title = "Project title is required";
  } else if (title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  if (!desc || desc.trim().length === 0) {
    errors.desc = "Description is required";
  } else if (desc.trim().length < 10) {
    errors.desc = "Description must be at least 10 characters";
  }

  if (!currency) {
    errors.currency = "Currency is required";
  }

  if (!budget || budget.trim().length === 0) {
    errors.budget = "Budget is required";
  } else {
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      errors.budget = "Budget must be a valid positive number";
    }
  }

  if (!deadline || deadline.trim().length === 0) {
    errors.deadline = "Deadline is required";
  } else {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) {
      errors.deadline = "Deadline must be in the future";
    }
  }

  if (!capacity || capacity.trim().length === 0) {
    errors.capacity = "Capacity is required";
  } else {
    const capacityValue = parseInt(capacity);
    if (isNaN(capacityValue) || capacityValue < 1) {
      errors.capacity = "Capacity must be at least 1";
    }
  }

  return errors;
}






