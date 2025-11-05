/**
 * Custom hook for dispute creation logic
 */
import { useState, useEffect } from "react";
import { DisputeSubjectType } from "@/src/models/dispute";
import { validateDisputeForm, ValidationErrors } from "@/src/utils/disputeValidation";
import { uploadEvidenceFiles } from "@/src/utils/disputeFileHandling";
import { useAuthStore } from "@/src/store";
import { useToast } from "@/src/hooks/useToast";

export interface UseDisputeCreationResult {
  reason: string;
  description: string;
  evidenceFiles: File[];
  errors: ValidationErrors;
  submitting: boolean;
  setReason: (reason: string) => void;
  setDescription: (description: string) => void;
  handleFileSelect: (files: File[]) => void;
  clearError: (field: string) => void;
  validate: () => boolean;
  submitDispute: (
    subjectType: DisputeSubjectType,
    subjectId: string,
    onSubmit: (dispute: any) => Promise<void>,
    onSuccess: () => void
  ) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing dispute creation state and logic
 */
export function useDisputeCreation(open: boolean): UseDisputeCreationResult {
  const { user } = useAuthStore();
  const [reason, setReasonState] = useState("");
  const [description, setDescriptionState] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  const handleFileSelect = (files: File[]) => {
    setEvidenceFiles(files);
    clearError("evidence");
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof ValidationErrors];
      return newErrors;
    });
  };

  const validate = (): boolean => {
    const validationErrors = validateDisputeForm({
      reason,
      description,
      evidenceFiles,
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const submitDispute = async (
    subjectType: DisputeSubjectType,
    subjectId: string,
    onSubmit: (dispute: any) => Promise<void>,
    onSuccess: () => void
  ) => {
    if (!user) {
      showError("You must be logged in to raise a dispute");
      return;
    }

    if (!validate()) {
      showError("Please fix the errors before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const evidenceUrls = await uploadEvidenceFiles(evidenceFiles);
      const disputeData = {
        subjectType,
        subjectId,
        reason: reason.trim(),
        description: description.trim(),
        evidence: evidenceUrls,
        raisedBy: user.id,
      };
      await onSubmit(disputeData);
      showSuccess(
        "Dispute raised successfully! It will be reviewed according to the escalation process."
      );
      onSuccess();
    } catch (error) {
      console.error("Failed to create dispute:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to raise dispute. Please try again."
      );
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setReasonState("");
    setDescriptionState("");
    setEvidenceFiles([]);
    setErrors({});
  };

  return {
    reason,
    description,
    evidenceFiles,
    errors,
    submitting,
    setReason: (reason) => {
      setReasonState(reason);
      clearError("reason");
    },
    setDescription: (description) => {
      setDescriptionState(description);
      clearError("description");
    },
    handleFileSelect,
    clearError,
    validate,
    submitDispute,
    reset,
  };
}





