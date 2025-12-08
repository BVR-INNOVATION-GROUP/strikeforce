/**
 * Manual Entry Validation Utilities
 */

export interface ManualEntryFormData {
  name: string;
  email: string;
  department?: string; // Required for supervisors
  course?: string; // Required for students
  gender?: string; // For students
  district?: string; // For students
  universityBranch?: string; // For students
  birthYear?: string; // For students (as string for form input)
  enrollmentYear?: string; // For students (as string for form input)
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  department?: string; // Required for supervisors
  course?: string; // Required for students
  enrollmentYear?: string; // Required for students
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
      // Department is no longer required - it's derived from course
      // Course is required and will carry the department information
      if (!data.course) {
        errors.course = "Course is required for students";
      }
      // Enrollment year is required for students
      if (!data.enrollmentYear || data.enrollmentYear.trim().length === 0) {
        errors.enrollmentYear = "Enrollment year is required for students";
      } else {
        const year = parseInt(data.enrollmentYear, 10);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 2000 || year > currentYear + 1) {
          errors.enrollmentYear = `Enrollment year must be between 2000 and ${currentYear + 1}`;
        }
      }
    }

    if (uploadType === "supervisor") {
      // Department is required for supervisors
      if (!data.department) {
        errors.department = "Department is required for supervisors";
      }
    }
  }

  return errors;
}






