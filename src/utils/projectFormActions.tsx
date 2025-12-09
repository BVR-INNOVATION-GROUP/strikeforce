/**
 * Project Form Actions Helper
 */
import React, { ReactNode } from "react";
import Button from "@/src/components/core/Button";
import { ArrowRight, CheckCircle } from "lucide-react";

export interface GetActionsParams {
  step: number;
  onCancel: () => void;
  onContinue: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * Get action buttons for project form modal based on current step
 */
export function getProjectFormActions({
  step,
  onCancel,
  onContinue,
  onBack,
  onSubmit,
  isSubmitting = false,
}: GetActionsParams): ReactNode[] {
  switch (step) {
    case 1:
      return [
        <Button key="cancel" onClick={onCancel} className="bg-pale">
          Cancel
        </Button>,
        <Button key="continue" onClick={onContinue} className="bg-primary">
          Continue
          <ArrowRight size={16} />
        </Button>,
      ];

    case 2:
      return [
        <Button key="back" onClick={onBack} className="bg-pale">
          Back
        </Button>,
        <Button key="continue" onClick={onContinue} className="bg-primary">
          Continue
          <ArrowRight size={16} />
        </Button>,
      ];

    case 3:
      return [
        <Button key="back" onClick={onBack} className="bg-pale">
          Back
        </Button>,
        <Button key="continue" onClick={onContinue} className="bg-primary">
          Continue
          <ArrowRight size={16} />
        </Button>,
      ];

    case 4:
      return [
        <Button key="back" onClick={onBack} className="bg-pale" disabled={isSubmitting}>
          Back
        </Button>,
        <Button key="submit" onClick={onSubmit} className="bg-primary" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit new project"}
          {!isSubmitting && <CheckCircle size={16} />}
        </Button>,
      ];

    default:
      return [];
  }
}


