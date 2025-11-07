/**
 * Custom hook for edit project form logic
 */
import { useState, useEffect } from "react";
import { ProjectI } from "@/src/models/project";
import { validateEditProject, ValidationErrors } from "@/src/utils/editProjectValidation";
import { useToast } from "@/src/hooks/useToast";

export interface UseEditProjectFormResult {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  errors: ValidationErrors;
  saving: boolean;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setBudget: (budget: string) => void;
  setDeadline: (deadline: string) => void;
  clearError: (field: string) => void;
  validate: () => boolean;
  handleSave: (project: ProjectI, onSave: (data: Partial<ProjectI>) => Promise<void>) => Promise<boolean>;
  reset: (project: ProjectI | null) => void;
}

/**
 * Hook for managing edit project form state and logic
 */
export function useEditProjectForm(open: boolean, project: ProjectI | null): UseEditProjectFormResult {
  const [title, setTitleState] = useState(project?.title || "");
  const [description, setDescriptionState] = useState(project?.description || "");
  const [budget, setBudgetState] = useState(project?.budget.toString() || "");
  const [deadline, setDeadlineState] = useState(
    project?.deadline ? new Date(project.deadline).toISOString().split("T")[0] : ""
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    if (project) {
      setTitleState(project.title);
      setDescriptionState(project.description);
      setBudgetState(project.budget.toString());
      setDeadlineState(
        project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : ""
      );
    }
  }, [project]);

  useEffect(() => {
    if (!open) {
      setErrors({});
    }
  }, [open]);

  const validate = (): boolean => {
    const validationErrors = validateEditProject({ title, description, budget, deadline });
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

  const handleSave = async (
    project: ProjectI,
    onSave: (data: Partial<ProjectI>) => Promise<void>
  ): Promise<boolean> => {
    if (!validate()) {
      showError("Please fix the errors before saving");
      return false;
    }

    setSaving(true);
    try {
      await onSave({
        title,
        description,
        budget: parseFloat(budget) || 0,
        deadline: new Date(deadline).toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Save failed:", error);
      showError(error instanceof Error ? error.message : "Failed to save project");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const reset = (project: ProjectI | null) => {
    if (project) {
      setTitleState(project.title);
      setDescriptionState(project.description);
      setBudgetState(project.budget.toString());
      setDeadlineState(
        project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : ""
      );
    }
    setErrors({});
  };

  return {
    title,
    description,
    budget,
    deadline,
    errors,
    saving,
    setTitle: (title) => {
      setTitleState(title);
      clearError("title");
    },
    setDescription: (description) => {
      setDescriptionState(description);
      clearError("description");
    },
    setBudget: (budget) => {
      setBudgetState(budget);
      clearError("budget");
    },
    setDeadline: (deadline) => {
      setDeadlineState(deadline);
      clearError("deadline");
    },
    clearError,
    validate,
    handleSave,
    reset,
  };
}






