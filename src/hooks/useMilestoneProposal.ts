/**
 * Custom hook for milestone proposal form logic
 */
import { useState, useEffect } from "react";
import { MilestoneProposalI } from "@/src/models/milestone";
import {
  validateMilestoneProposal,
  ValidationErrors,
} from "@/src/utils/milestoneProposalValidation";
import { useToast } from "@/src/hooks/useToast";

export interface UseMilestoneProposalResult {
  title: string;
  scope: string;
  acceptanceCriteria: string;
  dueDate: string;
  amount: string;
  errors: ValidationErrors;
  submitting: boolean;
  setTitle: (title: string) => void;
  setScope: (scope: string) => void;
  setAcceptanceCriteria: (criteria: string) => void;
  setDueDate: (date: string) => void;
  setAmount: (amount: string) => void;
  clearError: (field: string) => void;
  validate: () => boolean;
  prepareProposal: (
    projectId: string,
    proposerId: string
  ) => Partial<MilestoneProposalI>;
  reset: () => void;
}

/**
 * Hook for managing milestone proposal form state and logic
 */
export function useMilestoneProposal(
  open: boolean
): UseMilestoneProposalResult {
  const [title, setTitleState] = useState("");
  const [scope, setScopeState] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteriaState] = useState("");
  const [dueDate, setDueDateState] = useState("");
  const [amount, setAmountState] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting /* setSubmitting */] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    if (!open) {
      // reset();
    }
  }, [open]);

  const validate = (): boolean => {
    const validationErrors = validateMilestoneProposal({
      title,
      scope,
      acceptanceCriteria,
      dueDate,
      amount,
    });
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

  const prepareProposal = (
    projectId: string,
    proposerId: string
  ): Partial<MilestoneProposalI> => {
    return {
      projectId,
      proposerId,
      title: title.trim(),
      scope: scope.trim(),
      acceptanceCriteria: acceptanceCriteria.trim(),
      dueDate: new Date(dueDate).toISOString(),
      amount: amount ? parseFloat(amount) : undefined,
      status: "PROPOSED",
    };
  };

  const reset = () => {
    setTitleState("");
    setScopeState("");
    setAcceptanceCriteriaState("");
    setDueDateState("");
    setAmountState("");
    setErrors({});
  };

  return {
    title,
    scope,
    acceptanceCriteria,
    dueDate,
    amount,
    errors,
    submitting,
    setTitle: (title) => {
      setTitleState(title);
      clearError("title");
    },
    setScope: (scope) => {
      setScopeState(scope);
      clearError("scope");
    },
    setAcceptanceCriteria: (criteria) => {
      setAcceptanceCriteriaState(criteria);
      clearError("acceptanceCriteria");
    },
    setDueDate: (date) => {
      setDueDateState(date);
      clearError("dueDate");
    },
    setAmount: (amount) => {
      setAmountState(amount);
      clearError("amount");
    },
    clearError,
    validate,
    prepareProposal,
    reset,
  };
}
