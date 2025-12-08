/**
 * Custom hook for project form submission logic
 */
import { useState } from "react";
import { ProjectI } from "@/src/models/project";
import {
  validateStep1,
  validateStep2,
} from "@/src/utils/projectFormValidation";
import { buildProjectFromForm } from "@/src/utils/projectFormSubmission";
import { useToast } from "@/src/hooks/useToast";
import { uploadProjectFiles } from "@/src/utils/projectFileUpload";

export interface UseProjectFormSubmissionResult {
  errors: Record<string, string>;
  step: number;
  setStep: (step: number) => void;
  clearError: (field: string) => void;
  handleStep1Continue: (formState: unknown) => boolean;
  handleStep2Continue: (formState: unknown) => boolean;
  handleSubmit: (
    formState: unknown,
    onSubmit?: (project: unknown) => void,
    setOpen?: (open: boolean) => void
  ) => Promise<boolean>;
  isSubmitting: boolean;
}

/**
 * Hook for managing project form validation and submission
 * @param isEditMode - Whether the form is in edit mode (for success message)
 */
export function useProjectFormSubmission(
  isEditMode: boolean = false
): UseProjectFormSubmissionResult {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useToast();

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleStep1Continue = (formState: unknown): boolean => {
    const validationErrors = validateStep1(
      formState.university,
      formState.department,
      formState.course,
      formState.selectedSkills
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError("Please fix the errors before continuing");
      return false;
    }

    setStep(2);
    setErrors({});
    return true;
  };

  const handleStep2Continue = (formState: unknown): boolean => {
    const validationErrors = validateStep2(
      formState.title,
      formState.desc || "",
      formState.summary,
      formState.challengeStatement,
      formState.scopeActivities,
      formState.teamStructure,
      formState.duration,
      formState.expectations,
      formState.currency,
      formState.budget,
      formState.deadline,
      formState.capacity
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError("Please fix the errors before continuing");
      return false;
    }

    setStep(3);
    setErrors({});
    return true;
  };

  const handleSubmit = async (
    formState: unknown,
    onSubmit?: (project: unknown) => void,
    setOpen?: (open: boolean) => void
  ): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Step 3 validation - attachments are optional, so no validation needed
      // Upload files first if there are unknown attachments
      let attachmentPaths: string[] = [];

      if (formState.attachments && formState.attachments.length > 0) {
        try {
          // Check if attachments are File objects (need upload) or strings (already uploaded)
          const filesToUpload = formState.attachments.filter(
            (item: File | string) => item instanceof File
          ) as File[];

          if (filesToUpload.length > 0) {
            // Upload files to Cloudinary and get URLs (no compression)
            attachmentPaths = await uploadProjectFiles(filesToUpload);
          }

          // Include unknown existing paths (strings) that were already uploaded
          const existingPaths = formState.attachments.filter(
            (item: File | string) => typeof item === "string"
          ) as string[];
          attachmentPaths = [...attachmentPaths, ...existingPaths];
        } catch (error) {
          showError(
            error instanceof Error
              ? error.message
              : "Failed to upload files. Please try again."
          );
          return false;
        }
      }

      // Build project with uploaded file paths
      let newProject: Omit<
        ProjectI,
        "id" | "createdAt" | "updatedAt" | "partnerId"
      >;
      try {
        console.log("[useProjectFormSubmission] Building project from form data:", {
          formState: {
            ...formState,
            attachments: attachmentPaths.length,
          },
          timestamp: new Date().toISOString(),
        });
        newProject = buildProjectFromForm({
          ...formState,
          attachments: attachmentPaths,
        });
        console.log("[useProjectFormSubmission] Project built successfully:", {
          project: {
            ...newProject,
            description: newProject.description?.substring(0, 50) + "...",
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("[useProjectFormSubmission] Error building project:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Please fill in all required fields"
        );
        return false;
      }

      try {
        console.log("[useProjectFormSubmission] Calling onSubmit (will make API call):", {
          hasOnSubmit: !!onSubmit,
          timestamp: new Date().toISOString(),
        });
        // Call onSubmit and wait for it to complete (this makes the network call)
        await onSubmit?.(newProject);
        console.log("[useProjectFormSubmission] onSubmit completed successfully");
        
        // Only show success and close modal if onSubmit completes without error
        showSuccess(
          isEditMode
            ? "Project updated successfully!"
            : "Project created successfully!"
        );
        setOpen?.(false);
        setStep(1);
        setErrors({});
        return true;
      } catch (error) {
        // Show error message from the error if available, otherwise generic message
        const errorMessage = error instanceof Error 
          ? error.message 
          : (isEditMode
              ? "Failed to update project. Please try again."
              : "Failed to create project. Please try again.");
        showError(errorMessage);
        return false;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    errors,
    step,
    setStep,
    clearError,
    handleStep1Continue,
    handleStep2Continue,
    handleSubmit,
    isSubmitting,
  };
}
