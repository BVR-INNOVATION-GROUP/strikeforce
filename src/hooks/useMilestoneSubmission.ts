/**
 * Custom hook for milestone submission form logic
 */
import { useState, useEffect } from "react";
import { SubmissionI } from "@/src/models/submission";
import { MilestoneI } from "@/src/models/milestone";
import { UserI } from "@/src/models/user";
import { validateMilestoneSubmission, ValidationErrors } from "@/src/utils/milestoneSubmissionValidation";
import { uploadSubmissionFiles } from "@/src/utils/milestoneSubmissionFileHandling";
import { useToast } from "@/src/hooks/useToast";

export interface UseMilestoneSubmissionResult {
  notes: string;
  files: File[];
  errors: ValidationErrors;
  submitting: boolean;
  setNotes: (notes: string) => void;
  setFiles: (files: File[]) => void;
  clearError: (field: string) => void;
  validate: () => boolean;
  prepareSubmission: (milestone: MilestoneI, userId: string) => Promise<Partial<SubmissionI>>;
  reset: () => void;
}

/**
 * Hook for managing milestone submission form state and logic
 */
export function useMilestoneSubmission(open: boolean): UseMilestoneSubmissionResult {
  const [notes, setNotesState] = useState("");
  const [files, setFilesState] = useState<File[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  const validate = (): boolean => {
    const validationErrors = validateMilestoneSubmission({ notes, files });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof ValidationErrors];
      return newErrors;
    });
  };

  const prepareSubmission = async (
    milestone: MilestoneI,
    userId: string
  ): Promise<Partial<SubmissionI>> => {
    const fileUrls = await uploadSubmissionFiles(files);
    return {
      milestoneId: milestone.id,
      byStudentId: userId,
      files: fileUrls,
      notes: notes.trim(),
    };
  };

  const reset = () => {
    setNotesState("");
    setFilesState([]);
    setErrors({});
  };

  return {
    notes,
    files,
    errors,
    submitting,
    setNotes: (notes) => {
      setNotesState(notes);
      clearError("notes");
    },
    setFiles: (files) => {
      setFilesState(files);
      clearError("files");
    },
    clearError,
    validate,
    prepareSubmission,
    reset,
  };
}






