/**
 * Project Form - Multi-step form for creating projects
 */
"use client";

import React, { useMemo, useCallback } from "react";
import Modal from "@/src/components/base/Modal";
import ProjectFormStep1 from "./ProjectFormStep1";
import ProjectFormStep2 from "./ProjectFormStep2";
import ProjectFormStep3 from "./ProjectFormStep3";
import ProjectFormStep4 from "./ProjectFormStep4";
import { useProjectForm } from "@/src/hooks/useProjectForm";
import { getProjectFormActions } from "@/src/utils/projectFormActions";
import { useProjectFormSubmission } from "@/src/hooks/useProjectFormSubmission";
import { ProjectI } from "./Project";
import { ProjectI as ModelProjectI } from "@/src/models/project";

export interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: Partial<{
    university: { value: string; label: string; icon?: string } | undefined;
    department: { value: string; label: string } | null;
    course: { value: string; label: string } | null;
    currency: { value: string; label: string; icon?: string } | null;
    title: string;
    desc: string;
    summary: string;
    challengeStatement: string;
    scopeActivities: string;
    deliverablesMilestones: string;
    teamStructure: "individuals" | "groups" | "both" | "";
    duration: string;
    expectations: string;
    budget: string;
    deadline: string;
    capacity: string;
    selectedSkills: string[];
    partnerSignature?: string | null;
  }>;
  onSubmit?: (
    project: Omit<
      ModelProjectI,
      "id" | "createdAt" | "updatedAt" | "partnerId"
    >
  ) => void | Promise<void>;
  isSaving?: boolean;
}

/**
 * Multi-step project creation form
 */
const ProjectForm = (props: Props) => {
  const [formState, formActions] = useProjectForm(props.open, props.initialData);
  const isEditMode = !!props.initialData;
  const {
    step,
    setStep,
    errors,
    clearError,
    handleStep1Continue,
    handleStep2Continue,
    handleStep3Continue,
    handleSubmit: handleFormSubmit,
    isSubmitting: internalIsSubmitting,
  } = useProjectFormSubmission(isEditMode);

  // Use external isSaving prop if provided (for edit mode), otherwise use internal isSubmitting
  const isSubmitting = props.isSaving !== undefined ? props.isSaving : internalIsSubmitting;

  // Memoize callbacks to prevent infinite re-renders
  const handleCancel = useCallback(() => {
    props?.setOpen && props?.setOpen(false);
  }, [props?.setOpen]);

  const handleClose = useCallback(() => {
    props?.setOpen && props?.setOpen(false);
  }, [props?.setOpen]);

  const handleStep1ContinueWrapper = useCallback(() => {
    if (handleStep1Continue(formState)) {
      // Step transition handled in hook
    }
  }, [handleStep1Continue, formState]);

  const handleStep2ContinueWrapper = useCallback(() => {
    if (handleStep2Continue(formState)) {
      // Step transition handled in hook
    }
  }, [handleStep2Continue, formState]);

  const handleBack = useCallback(() => {
    setStep(step - 1);
  }, [setStep, step]);

  const handleSubmit = useCallback(async () => {
    await handleFormSubmit(formState, props.onSubmit, props.setOpen);
  }, [handleFormSubmit, formState, props.onSubmit, props.setOpen]);

  // Memoize actions array to prevent infinite re-renders
  const actions = useMemo(() => {
    return getProjectFormActions({
      step,
      onCancel: handleCancel,
      onContinue: step === 1 
        ? handleStep1ContinueWrapper 
        : step === 2 
        ? handleStep2ContinueWrapper 
        : step === 3
        ? () => {
            if (handleStep3Continue(formState)) {
              // Step transition handled in hook
            }
          }
        : undefined,
      onBack: handleBack,
      onSubmit: handleSubmit,
      isSubmitting,
    });
  }, [step, handleCancel, handleStep1ContinueWrapper, handleStep2ContinueWrapper, handleBack, handleSubmit, isSubmitting]);

  return (
    <>
      <Modal
        open={props?.open}
        actions={actions}
        title={isEditMode ? "Edit Project" : "Add project"}
        handleClose={handleClose}
      >
        <div className="flex flex-col gap-8">
          {step === 1 ? (
            <ProjectFormStep1
              university={formState.university}
              department={formState.department}
              course={formState.course}
              selectedSkills={formState.selectedSkills}
              errors={errors}
              onUniversityChange={formActions.setUniversity}
              onDepartmentChange={formActions.setDepartment}
              onCourseChange={formActions.setCourse}
              onSkillToggle={formActions.toggleSkill}
              onSkillsChange={formActions.setSelectedSkills}
              onClearError={clearError}
            />
          ) : step === 2 ? (
            <ProjectFormStep2
              title={formState.title}
              desc={formState.desc}
              summary={formState.summary}
              challengeStatement={formState.challengeStatement}
              scopeActivities={formState.scopeActivities}
              teamStructure={formState.teamStructure}
              duration={formState.duration}
              durationValue={formState.durationValue}
              durationUnit={formState.durationUnit}
              expectations={formState.expectations}
              budget={formState.budget}
              deadline={formState.deadline}
              capacity={formState.capacity}
              currency={formState.currency}
              errors={errors}
              onTitleChange={formActions.setTitle}
              onDescChange={formActions.setDesc}
              onSummaryChange={formActions.setSummary}
              onChallengeStatementChange={formActions.setChallengeStatement}
              onScopeActivitiesChange={formActions.setScopeActivities}
              onTeamStructureChange={formActions.setTeamStructure}
              onDurationChange={formActions.setDuration}
              onDurationValueChange={formActions.setDurationValue}
              onDurationUnitChange={formActions.setDurationUnit}
              onExpectationsChange={formActions.setExpectations}
              onBudgetChange={formActions.setBudget}
              onDeadlineChange={formActions.setDeadline}
              onCapacityChange={formActions.setCapacity}
              onCurrencyChange={formActions.setCurrency}
              onClearError={clearError}
            />
          ) : step === 3 ? (
            <ProjectFormStep3
              attachments={formState.attachments}
              errors={errors}
              onAttachmentsChange={formActions.setAttachments}
              onClearError={clearError}
            />
          ) : (
            step === 4 && (
              <ProjectFormStep4
                partnerSignature={formState.partnerSignature}
                errors={errors}
                onSignatureChange={formActions.setPartnerSignature}
                onClearError={clearError}
              />
            )
          )}
        </div>
      </Modal>
    </>
  );
};

export default ProjectForm;
