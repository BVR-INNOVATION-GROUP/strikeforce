/**
 * Project Detail Modals Component
 */
"use client";

import React from "react";
import AddMilestoneModal from "./AddMilestoneModal";
import EditProjectModal from "./EditProjectModal";
import ReassignProjectModal from "./ReassignProjectModal";
import ApplicationDetailModal from "./ApplicationDetailModal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { MilestoneI } from "@/src/models/milestone";
import { ProjectI } from "@/src/models/project";
import { ApplicationI } from "@/src/models/application";

export interface Props {
  isMilestoneModalOpen: boolean;
  isEditMilestoneModalOpen: boolean;
  selectedMilestoneId: string | null;
  milestones: MilestoneI[];
  isEditModalOpen: boolean;
  showReassignConfirm: boolean;
  showDeleteConfirm: boolean;
  showReassignProjectModal: boolean;
  selectedApplicationId: string | null;
  isApplicationDetailModalOpen: boolean;
  selectedApplicationDetailId: number | null;
  projectData: ProjectI | null;
  applications: ApplicationI[];
  onCloseMilestoneModal: () => void;
  onCloseEditMilestoneModal: () => void;
  onCloseEditModal: () => void;
  onCloseReassignConfirm: () => void;
  onCloseDeleteConfirm: () => void;
  onCloseReassignProjectModal: () => void;
  onCloseApplicationDetailModal: () => void;
  onCreateMilestone: (title: string, scope: string, dueDate: string, amount: string, currency?: string) => Promise<void>;
  onUpdateMilestone?: (milestoneId: string, title: string, scope: string, dueDate: string, amount: string, currency?: string) => Promise<void>;
  onSaveProject: (data: Partial<ProjectI>) => Promise<void>;
  isSaving?: boolean;
  onConfirmReassign: () => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  isDeleting?: boolean;
  onReassignProject: (applicationId: number) => Promise<void>;
  applicationDisplay: Array<{
    id: number;
    groupName: string;
    members: Array<{ name: string; avatar: string }>;
    status: string;
    portfolioScore: number;
    appliedAt: string;
    applicantType?: string;
    rawStatus?: string;
  }>;
  currentAssignedApplicationId?: number | null;
}

/**
 * All modals and dialogs for project detail page
 */
const ProjectDetailModals = ({
  isMilestoneModalOpen,
  isEditMilestoneModalOpen,
  selectedMilestoneId,
  milestones,
  isEditModalOpen,
  showReassignConfirm,
  showDeleteConfirm,
  showReassignProjectModal,
  isApplicationDetailModalOpen,
  selectedApplicationDetailId,
  projectData,
  applications,
  onCloseMilestoneModal,
  onCloseEditMilestoneModal,
  onCloseEditModal,
  onCloseReassignConfirm,
  onCloseDeleteConfirm,
  onCloseReassignProjectModal,
  onCloseApplicationDetailModal,
  onCreateMilestone,
  onUpdateMilestone,
  onSaveProject,
  isSaving = false,
  onConfirmReassign,
  onConfirmDelete,
  isDeleting = false,
  onReassignProject,
  applicationDisplay,
  currentAssignedApplicationId,
}: Props) => {
  // Find currently assigned application ID
  const assignedApp = applicationDisplay.find(app => (app.rawStatus || app.status.toUpperCase()) === "ASSIGNED")
  const assignedAppId = assignedApp?.id || currentAssignedApplicationId

  // Find milestone to edit
  // Handle both string and number ID comparisons
  const milestoneToEdit = selectedMilestoneId 
    ? milestones.find(m => {
        if (!m || m.id === undefined || m.id === null) return false;
        const mId = typeof m.id === 'number' ? m.id.toString() : String(m.id);
        const selectedId = String(selectedMilestoneId);
        return mId === selectedId;
      }) 
    : null
  
  // If milestone not found but we have selectedMilestoneId, create a minimal milestone object
  // This ensures the modal can still work with just the ID
  // Convert selectedMilestoneId to number for MilestoneI.id (which is number)
  const milestoneForEdit = milestoneToEdit || (selectedMilestoneId ? {
    id: typeof selectedMilestoneId === 'string' ? parseInt(selectedMilestoneId, 10) : selectedMilestoneId,
  } as MilestoneI : null);
  
  // Debug logging
  if (selectedMilestoneId && !milestoneToEdit) {
    console.warn('Milestone not found in array for edit, using ID directly:', {
      selectedMilestoneId,
      availableMilestoneIds: milestones.map(m => m?.id),
      milestoneForEdit
    });
  }

  // Find application to show in detail modal
  const applicationDetail = selectedApplicationDetailId
    ? applications.find(a => a.id === selectedApplicationDetailId)
    : null
  const applicationDetailDisplay = selectedApplicationDetailId
    ? applicationDisplay.find(a => a.id === selectedApplicationDetailId)
    : undefined

  return (
    <>
      <AddMilestoneModal
        open={isMilestoneModalOpen}
        onClose={onCloseMilestoneModal}
        onCreate={onCreateMilestone}
        defaultCurrency={projectData?.currency}
      />
      <AddMilestoneModal
        open={isEditMilestoneModalOpen}
        onClose={onCloseEditMilestoneModal}
        onCreate={onCreateMilestone}
        onUpdate={onUpdateMilestone}
        milestone={milestoneForEdit}
        defaultCurrency={projectData?.currency}
      />
      {isEditModalOpen && (
        <EditProjectModal
          open={isEditModalOpen}
          project={projectData}
          onClose={onCloseEditModal}
          onSave={onSaveProject}
          isSaving={isSaving}
        />
      )}
      {showReassignProjectModal && (
        <ReassignProjectModal
          open={showReassignProjectModal}
          applications={applicationDisplay}
          currentAssignedApplicationId={assignedAppId}
          onClose={onCloseReassignProjectModal}
          onReassign={onReassignProject}
        />
      )}
      <ApplicationDetailModal
        open={isApplicationDetailModalOpen}
        onClose={onCloseApplicationDetailModal}
        application={applicationDetail || null}
        applicationDisplay={applicationDetailDisplay}
      />
      <ConfirmationDialog
        open={showReassignConfirm}
        onClose={onCloseReassignConfirm}
        onConfirm={onConfirmReassign}
        title="Reassign Group"
        message="Are you sure you want to reassign this group? This will unassign the current group."
        type="warning"
        confirmText="Reassign"
      />
      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={onCloseDeleteConfirm}
        onConfirm={onConfirmDelete}
        title="Delete Project"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete this project? This action cannot be undone.</p>
            <p className="text-sm opacity-75">All associated data including applications and milestones will be removed.</p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
      />
    </>
  );
};

export default ProjectDetailModals;


