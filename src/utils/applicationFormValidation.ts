/**
 * Application Form Validation Utilities
 */
import { ApplicationType } from "@/src/models/application";

export interface ApplicationFormData {
  applicantType: ApplicationType;
  selectedGroupId: string;
  statement: string;
}

export interface ValidationErrors {
  group?: string;
  statement?: string;
}

/**
 * Strip HTML tags to get plain text for validation
 */
function stripHtmlTags(html: string): string {
  if (typeof window === "undefined") {
    // Server-side: simple regex approach
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  }
  // Client-side: use DOM parser for better accuracy
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Validate application form fields
 */
export function validateApplicationForm(
  data: ApplicationFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (data.applicantType === "GROUP" && !data.selectedGroupId) {
    errors.group = "Please select a group";
  }

  // Strip HTML tags for validation
  const plainText = stripHtmlTags(data.statement || "");

  if (!data.statement || plainText.length === 0) {
    errors.statement = "Application statement is required";
  } else if (plainText.length < 50) {
    errors.statement = "Statement must be at least 50 characters";
  } else if (plainText.length > 2000) {
    errors.statement = "Statement must be less than 2000 characters";
  }

  return errors;
}






