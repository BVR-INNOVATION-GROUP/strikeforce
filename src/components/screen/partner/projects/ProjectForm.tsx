/**
 * Project Form - Multi-step form for creating projects
 */
"use client";

import React from "react";
import Modal from "@/src/components/base/Modal";
import ProjectFormStep1 from "./ProjectFormStep1";
import ProjectFormStep2 from "./ProjectFormStep2";
import ProjectFormStep3 from "./ProjectFormStep3";
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
    budget: string;
    deadline: string;
    capacity: string;
    selectedSkills: string[];
  }>;
  onSubmit?: (
    project: Omit<
      ModelProjectI,
      "id" | "createdAt" | "updatedAt" | "partnerId"
    >
  ) => void | Promise<void>;
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
    handleSubmit: handleFormSubmit,
  } = useProjectFormSubmission(isEditMode);

  const handleStep1ContinueWrapper = () => {
    if (handleStep1Continue(formState)) {
      // Step transition handled in hook
    }
  };

  const handleStep2ContinueWrapper = () => {
    if (handleStep2Continue(formState)) {
      // Step transition handled in hook
    }
  };

  const handleSubmit = async () => {
    await handleFormSubmit(formState, props.onSubmit, props.setOpen);
  };

  return (
    <>
      <Modal
        open={props?.open}
        actions={getProjectFormActions({
          step,
          onCancel: () => {
            props?.setOpen && props?.setOpen(false);
          },
          onContinue:
            step === 1
              ? handleStep1ContinueWrapper
              : handleStep2ContinueWrapper,
          onBack: () => setStep(step - 1),
          onSubmit: handleSubmit,
        })}
        title={isEditMode ? "Edit Project" : "Add project"}
        handleClose={() => {
          props?.setOpen && props?.setOpen(false);
        }}
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
              budget={formState.budget}
              deadline={formState.deadline}
              capacity={formState.capacity}
              currency={formState.currency}
              errors={errors}
              onTitleChange={formActions.setTitle}
              onDescChange={formActions.setDesc}
              onBudgetChange={formActions.setBudget}
              onDeadlineChange={formActions.setDeadline}
              onCapacityChange={formActions.setCapacity}
              onCurrencyChange={formActions.setCurrency}
              onClearError={clearError}
            />
          ) : (
            step === 3 && (
              <ProjectFormStep3
                attachments={formState.attachments}
                errors={errors}
                onAttachmentsChange={formActions.setAttachments}
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
