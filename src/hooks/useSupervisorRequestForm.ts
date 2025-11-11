/**
 * Custom hook for supervisor request form logic
 */
import { useState, useEffect } from "react";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { validateSupervisorRequest, SupervisorRequestFormData, ValidationErrors } from "@/src/utils/supervisorRequestValidation";
import { useToast } from "@/src/hooks/useToast";

export interface UseSupervisorRequestFormResult {
  formData: SupervisorRequestFormData;
  requestMessage: string;
  errors: ValidationErrors;
  submitting: boolean;
  setFormData: (data: SupervisorRequestFormData) => void;
  setRequestMessage: (message: string) => void;
  clearError: (field: string) => void;
  validate: () => boolean;
  handleSubmitRequest: (userId: string, onSuccess: (request: SupervisorRequestI) => void) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing supervisor request form state and logic
 */
export function useSupervisorRequestForm(isModalOpen: boolean): UseSupervisorRequestFormResult {
  const [formData, setFormData] = useState<SupervisorRequestFormData>({
    projectId: "",
    supervisorId: "",
  });
  const [requestMessage, setRequestMessage] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (!isModalOpen) {
      reset();
    }
  }, [isModalOpen]);

  const validate = (): boolean => {
    const validationErrors = validateSupervisorRequest(formData);
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

  const handleSubmitRequest = async (
    userId: string,
    onSuccess: (request: SupervisorRequestI) => void
  ) => {
    if (!validate()) {
      showError("Please fix the errors before submitting the request");
      return;
    }

    setSubmitting(true);
    try {
      // Convert IDs to numbers for service
      const numericProjectId = typeof formData.projectId === 'string' ? parseInt(formData.projectId, 10) : formData.projectId;
      const numericSupervisorId = typeof formData.supervisorId === 'string' ? parseInt(formData.supervisorId, 10) : formData.supervisorId;
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

      // Use supervisorService to create request with business validation
      const { supervisorService } = await import("@/src/services/supervisorService");
      const newRequest = await supervisorService.createRequest({
        projectId: numericProjectId,
        studentOrGroupId: numericUserId,
        supervisorId: numericSupervisorId,
        message: requestMessage.trim(),
      });

      onSuccess(newRequest);
      showSuccess("Supervisor request submitted successfully!");
      reset();
    } catch (error) {
      console.error("Failed to submit supervisor request:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to submit supervisor request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFormData({ projectId: "", supervisorId: "" });
    setRequestMessage("");
    setErrors({});
  };

  return {
    formData,
    requestMessage,
    errors,
    submitting,
    setFormData,
    setRequestMessage,
    clearError,
    validate,
    handleSubmitRequest,
    reset,
  };
}




