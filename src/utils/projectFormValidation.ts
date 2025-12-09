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
  summary?: string;
  challengeStatement?: string;
  scopeActivities?: string;
  teamStructure?: string;
  duration?: string;
  expectations?: string;
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
  summary: string,
  challengeStatement: string,
  scopeActivities: string,
  teamStructure: "individuals" | "groups" | "both" | "",
  duration: string,
  expectations: string,
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

  if (!summary || summary.trim().length === 0) {
    errors.summary = "Project summary is required";
  } else if (summary.trim().length < 10) {
    errors.summary = "Summary must be at least 10 characters";
  }

  if (!challengeStatement || challengeStatement.trim().length === 0) {
    errors.challengeStatement = "Challenge/opportunity statement is required";
  } else if (challengeStatement.trim().length < 10) {
    errors.challengeStatement = "Challenge statement must be at least 10 characters";
  }

  if (!scopeActivities || scopeActivities.trim().length === 0) {
    errors.scopeActivities = "Project scope/activities is required";
  } else if (scopeActivities.trim().length < 10) {
    errors.scopeActivities = "Scope/activities must be at least 10 characters";
  }

  if (!teamStructure || teamStructure === "") {
    errors.teamStructure = "Team structure is required";
  } else if (!["individuals", "groups", "both"].includes(teamStructure)) {
    errors.teamStructure = "Team structure must be one of: individuals, groups, both";
  }

  if (!duration || duration.trim().length === 0) {
    errors.duration = "Project duration is required";
  }

  if (!expectations || expectations.trim().length === 0) {
    errors.expectations = "Expectations are required";
  } else if (expectations.trim().length < 10) {
    errors.expectations = "Expectations must be at least 10 characters";
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









