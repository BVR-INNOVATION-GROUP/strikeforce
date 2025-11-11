/**
 * Custom hook for application form logic
 */
import { useState, useEffect } from "react";
import { ApplicationType } from "@/src/models/application";
import { GroupI } from "@/src/models/group";
import { UserI } from "@/src/models/user";
import { validateApplicationForm } from "@/src/utils/applicationFormValidation";
import { useToast } from "@/src/hooks/useToast";

export interface UseApplicationFormResult {
  applicantType: ApplicationType;
  selectedGroupId: string;
  statement: string;
  attachments: File[];
  errors: Record<string, string>;
  submitting: boolean;
  availableGroups: GroupI[];
  setApplicantType: (type: ApplicationType) => void;
  setSelectedGroupId: (groupId: string) => void;
  setStatement: (statement: string) => void;
  setAttachments: (files: File[]) => void;
  clearError: (field: string) => void;
  validate: () => boolean;
  reset: () => void;
}

/**
 * Hook for managing application form state and logic
 */
export function useApplicationForm(
  open: boolean,
  groups: GroupI[],
  user: UserI | null
): UseApplicationFormResult {
  const [applicantType, setApplicantTypeState] =
    useState<ApplicationType>("INDIVIDUAL");
  const [selectedGroupId, setSelectedGroupIdState] = useState<string>("");
  const [statement, setStatementState] = useState("");
  const [attachments, setAttachmentsState] = useState<File[]>([]);
  const [submitting /* setSubmitting */] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showError } = useToast();

  useEffect(() => {
    if (!open) {
      // reset();
    }
  }, [open]);

  const getAvailableGroups = (): GroupI[] => {
    if (!user) return [];
    return groups.filter(
      (g) => g.leaderId === user.id || g.memberIds.includes(user.id)
    );
  };

  const validate = (): boolean => {
    const validationErrors = validateApplicationForm({
      applicantType,
      selectedGroupId,
      statement,
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const reset = () => {
    setApplicantTypeState("INDIVIDUAL");
    setSelectedGroupIdState("");
    setStatementState("");
    setAttachmentsState([]);
    setErrors({});
  };

  return {
    applicantType,
    selectedGroupId,
    statement,
    attachments,
    errors,
    submitting,
    availableGroups: getAvailableGroups(),
    setApplicantType: (type) => {
      setApplicantTypeState(type);
      if (type === "INDIVIDUAL") {
        setSelectedGroupIdState("");
        clearError("group");
      }
    },
    setSelectedGroupId: (groupId) => {
      setSelectedGroupIdState(groupId);
      clearError("group");
    },
    setStatement: (statement) => {
      setStatementState(statement);
      clearError("statement");
    },
    setAttachments: (files) => {
      setAttachmentsState(files);
      clearError("attachments");
    },
    clearError,
    validate,
    reset,
  };
}
