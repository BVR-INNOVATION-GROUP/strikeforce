/**
 * Manual Entry Validation Utilities
 */

export interface ManualEntryFormData {
  name: string;
  email: string;
  department: string;
  course: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  department?: string;
  course?: string;
}

export type UploadType = "student" | "supervisor" | "department" | "course";

/**
 * Validate manual entry form based on upload type
 */
export function validateManualEntry(
  data: ManualEntryFormData,
  uploadType: UploadType
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Name is required";
  }

  if (uploadType === "student" || uploadType === "supervisor") {
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Invalid email format";
    }

    if (uploadType === "student") {
      if (!data.department) {
        errors.department = "Department is required for students";
      }
      if (!data.course) {
        errors.course = "Course is required for students";
      }
    }
  }

  return errors;
}





