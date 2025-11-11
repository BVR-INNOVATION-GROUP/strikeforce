/**
 * Custom hook for invite acceptance logic
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { invitationService } from "@/src/services/invitationService";
import { InvitationI } from "@/src/models/invitation";
import {
  validateInviteAcceptance,
  ValidationErrors,
} from "@/src/utils/inviteAcceptanceValidation";
import { useToast } from "@/src/hooks/useToast";

export interface UseInviteAcceptanceResult {
  invitation: InvitationI | null;
  validating: boolean;
  formData: {
    password: string;
    confirmPassword: string;
  };
  errors: ValidationErrors;
  submitting: boolean;
  setFormData: (data: { password: string; confirmPassword: string }) => void;
  setFieldValue: (field: string, value: string) => void;
  clearError: (field: string) => void;
  validate: () => boolean;
  handleSubmit: (token: string | null) => Promise<void>;
}

/**
 * Hook for managing invite acceptance state and logic
 */
export function useInviteAcceptance(
  token: string | null
): UseInviteAcceptanceResult {
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationI | null>(null);
  const [validating, setValidating] = useState(true);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        showError("Invalid invitation link");
        setValidating(false);
        return;
      }

      try {
        const inv = await invitationService.validateInvitation(token);
        setInvitation(inv);
      } catch (error: unknown) {
        showError(error.message || "Invalid or expired invitation");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, showError]);

  const setFieldValue = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const validationErrors = validateInviteAcceptance(formData);
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

  const handleSubmit = async (token: string | null) => {
    if (!validate()) {
      showError("Please fix the errors before submitting");
      return;
    }

    if (!token) {
      showError("Invalid invitation token");
      return;
    }

    setSubmitting(true);
    try {
      const { user } = await invitationService.useInvitation(
        token,
        formData.password
      );
      showSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: unknown) {
      console.error("Failed to accept invitation:", error);
      showError(error.message || "Failed to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    invitation,
    validating,
    formData,
    errors,
    submitting,
    setFormData,
    setFieldValue,
    clearError,
    validate,
    handleSubmit,
  };
}
