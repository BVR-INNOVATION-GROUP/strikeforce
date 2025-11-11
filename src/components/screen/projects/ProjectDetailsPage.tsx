/**
 * Unified Project Details Page Component
 * Works for all user roles (partner, student, supervisor, etc.)
 * Handles role-based permissions and UI internally
 */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectHeader from "@/src/components/screen/partner/projects/ProjectHeader";
import ProjectContent from "@/src/components/screen/partner/projects/ProjectContent";
import ProjectSidebar from "@/src/components/screen/partner/projects/ProjectSidebar";
import ProjectDetailModals from "@/src/components/screen/partner/projects/ProjectDetailModals";
import ProjectDetailSkeleton from "@/src/components/screen/partner/projects/ProjectDetailSkeleton";
import ChatModal from "@/src/components/base/ChatModal";
import RecommendModal from "@/src/components/screen/partner/projects/RecommendModal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { useAuthStore } from "@/src/store";
import { useProjectDetailPage } from "@/src/hooks/useProjectDetailPage";
import { formatDateLong } from "@/src/utils/dateFormatters";
import { useToast } from "@/src/hooks/useToast";
import { notificationService } from "@/src/services/notificationService";

export interface Props {
  projectId: string;
}

/**
 * Unified Project Details Page
 * Adapts UI and functionality based on user role automatically
 */
export default function ProjectDetailsPage({ projectId }: Props) {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const toast = useToast();
  const [userLoading, setUserLoading] = useState(true);

  // Wait for hydration before checking user
  useEffect(() => {
    if (_hasHydrated) {
      if (!user) {
        // No user after hydration - redirect to login
        router.push("/auth/login");
      } else {
        setUserLoading(false);
      }
    }
  }, [user, _hasHydrated, router]);

  // Convert user ID to string for hook
  const userId = user?.id !== undefined ? String(user.id) : undefined;
  // Convert orgId to string for hook
  const orgId = user?.orgId !== undefined ? String(user.orgId) : undefined;

  const {
    project,
    loading,
    currencySymbol,
    daysUntilDeadline,
    messages,
    chatMessages,
    chatUsers,
    actions,
    mutations,
    modals,
    projectData,
    applications,
    milestones,
    handleAddMilestone,
    handleUpdateMilestone,
    handleDeleteMilestone: handleDeleteMilestoneFromHook,
    handleSaveProject,
    handleApproveAndRelease,
    handleDisapprove,
    handleRequestChanges,
    handleMarkAsComplete,
    handleUnmarkAsComplete,
    handleAcceptApplication,
    handleRejectApplication,
    handleRecommendApplication,
    handleDeleteProject,
    handleReassignProject,
    handleSendChatMessage,
    isSaving,
    isDeleting,
  } = useProjectDetailPage(projectId, orgId, userId);

  // Determine if user is project owner (partner who created the project)
  const isProjectOwner =
    user?.role === "partner" && user?.id === projectData?.partnerId;

  // Only super-admin can edit/delete projects - all other roles are read-only
  const canEditProject = user?.role === "super-admin";
  // Only project owner (partner) can manage applications (accept/reject/recommend)
  const canManageApplications = user?.role === "partner" && isProjectOwner;

  // Handle edit milestone
  const handleEditMilestone = (milestoneId: string) => {
    modals.openEditMilestoneModal(milestoneId);
  };

  const openDeleteMilestoneConfirm = (milestoneId: string) => {
    modals.openDeleteMilestoneConfirm(milestoneId);
  };

  // Handle student actions
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
  const [terminateConfirmOpen, setTerminateConfirmOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  const handleWithdrawApplication = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setWithdrawConfirmOpen(true);
  };

  const confirmWithdrawApplication = async () => {
    if (!selectedApplicationId) return;
    
    try {
      const { applicationService } = await import("@/src/services/applicationService");
      await applicationService.withdrawApplication(selectedApplicationId);
      
      // Reload applications to reflect the status change
      const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
      await applicationService.getProjectApplications(numericProjectId);
      // The page will refresh to show updated status
      const projectTitle = projectData?.title || project?.title || "Project";
      if (projectData?.partnerId) {
        await notificationService.createNotification({
          userId: projectData.partnerId,
          type: "info",
          title: "Application Withdrawn",
          message: `A student has withdrawn their application for '${projectTitle}'. Review remaining applicants or reopen the opportunity.`,
          link: "/partner/projects",
        });
      }
      
      toast.showSuccess("Application withdrawn successfully");
      setWithdrawConfirmOpen(false);
      setSelectedApplicationId(null);
      // Reload page to refresh applications
      router.refresh();
    } catch (error) {
      console.error("Failed to withdraw application:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to withdraw application");
    }
  };

  const handleTerminateContract = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setTerminateConfirmOpen(true);
  };

  const confirmTerminateContract = async () => {
    if (!selectedApplicationId) return;
    
    try {
      const { applicationService } = await import("@/src/services/applicationService");
      await applicationService.terminateContract(selectedApplicationId);
      
      // Reload applications to reflect the status change
      const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
      await applicationService.getProjectApplications(numericProjectId);
      // The page will refresh to show updated status
      const projectTitle = projectData?.title || project?.title || "Project";
      if (projectData?.partnerId) {
        await notificationService.createNotification({
          userId: projectData.partnerId,
          type: "alert",
          title: "Contract Terminated",
          message: `An assigned student group has terminated their contract for '${projectTitle}'. Consider reassigning the project to another applicant.`,
          link: "/partner/projects",
        });
      }
      
      toast.showSuccess("Contract terminated successfully");
      setTerminateConfirmOpen(false);
      setSelectedApplicationId(null);
      // Reload page to refresh applications
      router.refresh();
    } catch (error) {
      console.error("Failed to terminate contract:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to terminate contract");
    }
  };

  if (userLoading || loading || !project) {
    return <ProjectDetailSkeleton />;
  }

  // Note: Students can view all projects, but can only apply to projects from their university
  // This restriction is handled in the application form, not here

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 mb-8">
        <ProjectHeader
          title={project.title}
          status={project.status}
          createdAt={project.createdAt}
          onBack={() => router.back()}
          onOpenChat={
            applications.some((a) => a.status === "ASSIGNED")
              ? actions.handleOpenChat
              : undefined
          }
          formatDate={formatDateLong}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        <ProjectContent
          project={project}
          applications={applications}
          milestones={milestones}
          currencySymbol={currencySymbol}
          messages={messages}
          attachments={projectData?.attachments}
          formatDate={formatDateLong}
          onViewProfile={actions.handleViewProfile}
          onMessage={actions.handleMessage}
          onReassign={(applicationId: number) =>
            modals.openReassignProjectModal()
          }
          onAccept={canManageApplications
            ? (applicationId: number) =>
                modals.openAcceptConfirm(applicationId)
            : undefined}
          onReject={canManageApplications
            ? (applicationId: number) =>
                modals.openRejectConfirm(applicationId)
            : undefined}
          onRecommend={canManageApplications
            ? (applicationId: number) =>
                modals.openRecommendModal(applicationId)
            : undefined}
          onWithdraw={user?.role === "student" ? handleWithdrawApplication : undefined}
          onTerminate={user?.role === "student" ? handleTerminateContract : undefined}
          onOpenChat={actions.handleOpenChat}
          onAddMilestone={canEditProject ? modals.openMilestoneModal : undefined}
          onEditMilestone={canEditProject ? handleEditMilestone : undefined}
          onDeleteMilestone={canEditProject ? openDeleteMilestoneConfirm : undefined}
          onApproveAndRelease={handleApproveAndRelease}
          onDisapprove={handleDisapprove}
          onRequestChanges={handleRequestChanges}
          onMarkAsComplete={handleMarkAsComplete}
          onUnmarkAsComplete={handleUnmarkAsComplete}
          userRole={user?.role}
          isProjectOwner={isProjectOwner}
          canEditProject={canEditProject}
          currentUserId={user?.id}
        />

        <ProjectSidebar
          project={project}
          currencySymbol={currencySymbol}
          daysUntilDeadline={daysUntilDeadline}
          formatDate={formatDateLong}
          onEditProject={canEditProject ? modals.openEditModal : undefined}
          onExportDetails={() =>
            actions.handleExportDetails(projectData, applications, milestones)
          }
          onShareProject={async () => {
            const result = await actions.handleShareProject();
            if (result.success) {
              // Success handled by hook
            } else {
              // Error handled by hook
            }
          }}
          onReassignProject={canEditProject ? modals.openReassignProjectModal : undefined}
          onDeleteProject={canEditProject ? modals.openDeleteConfirm : undefined}
          userRole={user?.role}
          isProjectOwner={isProjectOwner}
          canEditProject={canEditProject}
        />
      </div>

      {/* Modals */}
      <ProjectDetailModals
        isMilestoneModalOpen={modals.isMilestoneModalOpen}
        isEditMilestoneModalOpen={modals.isEditMilestoneModalOpen}
        selectedMilestoneId={modals.selectedMilestoneId}
        milestones={milestones}
        isEditModalOpen={modals.isEditModalOpen}
        showReassignConfirm={modals.showReassignConfirm}
        showDeleteConfirm={modals.showDeleteConfirm}
        showReassignProjectModal={modals.showReassignProjectModal}
        selectedApplicationId={modals.selectedApplicationId}
        isApplicationDetailModalOpen={modals.isApplicationDetailModalOpen}
        selectedApplicationDetailId={modals.selectedApplicationDetailId}
        projectData={projectData}
        applications={applications}
        applicationDisplay={project?.applications || []}
        onCloseMilestoneModal={modals.closeMilestoneModal}
        onCloseEditMilestoneModal={modals.closeEditMilestoneModal}
        onCloseEditModal={modals.closeEditModal}
        onCloseReassignConfirm={modals.closeReassignConfirm}
        onCloseDeleteConfirm={modals.closeDeleteConfirm}
        onCloseReassignProjectModal={modals.closeReassignProjectModal}
        onCloseApplicationDetailModal={modals.closeApplicationDetailModal}
        onCreateMilestone={handleAddMilestone}
        onUpdateMilestone={handleUpdateMilestone}
        onSaveProject={handleSaveProject}
        isSaving={isSaving}
        onConfirmReassign={async () => {
          if (modals.selectedApplicationId) {
            try {
              const applicationId = parseInt(modals.selectedApplicationId, 10);
              if (!isNaN(applicationId)) {
                await mutations.handleReassignGroup(
                  modals.selectedApplicationId,
                  undefined
                );
                modals.closeReassignConfirm();
              }
            } catch (_error) {
              // Error handled by hook
            }
          }
        }}
        onConfirmDelete={handleDeleteProject}
        isDeleting={isDeleting}
        onReassignProject={handleReassignProject}
        currentAssignedApplicationId={
          applications.find((a) => a.status === "ASSIGNED")?.id || null
        }
      />

      {/* Chat Modal */}
      <ChatModal
        open={modals.isChatModalOpen}
        onClose={modals.closeChatModal}
        projectId={projectId}
        projectTitle={project?.title}
        applicationId={modals.selectedChatApplicationId}
        applicationName={
          modals.selectedChatApplicationId
            ? project?.applications.find(
                (app) => app.id === modals.selectedChatApplicationId
              )?.groupName
            : undefined
        }
        messages={chatMessages}
        users={chatUsers}
        currentUserId={user?.id ? String(user.id) : undefined}
        onSendMessage={handleSendChatMessage}
      />

      {/* Recommend Modal */}
      <RecommendModal
        open={modals.isRecommendModalOpen}
        onClose={modals.closeRecommendModal}
        onConfirm={async (partnerIds: string[]) => {
          if (modals.selectedRecommendApplicationId) {
            try {
              await handleRecommendApplication(
                modals.selectedRecommendApplicationId,
                partnerIds
              );
              modals.closeRecommendModal();
            } catch (error) {
              // Error handled by hook
            }
          }
        }}
        applicationGroupName={
          modals.selectedRecommendApplicationId
            ? project?.applications.find(
                (app) => app.id === modals.selectedRecommendApplicationId
              )?.groupName
            : undefined
        }
      />

      {/* Accept Confirmation */}
      <ConfirmationDialog
        open={modals.isAcceptConfirmOpen}
        onClose={modals.closeAcceptConfirm}
        onConfirm={async () => {
          if (modals.selectedAcceptApplicationId) {
            try {
              await handleAcceptApplication(modals.selectedAcceptApplicationId);
              modals.closeAcceptConfirm();
            } catch (_error) {
              // Error handled by hook
            }
          }
        }}
        title="Accept Application"
        message={
          modals.selectedAcceptApplicationId
            ? `Are you sure you want to accept ${
                project?.applications.find(
                  (app) => app.id === modals.selectedAcceptApplicationId
                )?.groupName || "this application"
              }?`
            : "Are you sure you want to accept this application?"
        }
        type="success"
        confirmText="Accept"
        cancelText="Cancel"
      />

      {/* Reject Confirmation */}
      <ConfirmationDialog
        open={modals.isRejectConfirmOpen}
        onClose={modals.closeRejectConfirm}
        onConfirm={async () => {
          if (modals.selectedRejectApplicationId) {
            try {
              await handleRejectApplication(modals.selectedRejectApplicationId);
              modals.closeRejectConfirm();
            } catch (_error) {
              // Error handled by hook
            }
          }
        }}
        title="Reject Application"
        message={
          modals.selectedRejectApplicationId
            ? `Are you sure you want to reject ${
                project?.applications.find(
                  (app) => app.id === modals.selectedRejectApplicationId
                )?.groupName || "this application"
              }? This action cannot be undone.`
            : "Are you sure you want to reject this application? This action cannot be undone."
        }
        type="danger"
        confirmText="Reject"
        cancelText="Cancel"
      />

      {/* Delete Milestone Confirmation */}
      <ConfirmationDialog
        open={modals.isDeleteMilestoneConfirmOpen}
        onClose={modals.closeDeleteMilestoneConfirm}
        onConfirm={async () => {
          if (modals.selectedDeleteMilestoneId) {
            try {
              await handleDeleteMilestoneFromHook(
                modals.selectedDeleteMilestoneId
              );
            } catch (_error) {
              // Error handled by hook
            }
          }
        }}
        title="Delete Milestone"
        message={
          <div className="space-y-2">
            <p>
              Are you sure you want to delete this milestone? This action cannot
              be undone.
            </p>
            <p className="text-sm opacity-75">
              Only PROPOSED or FINALIZED milestones can be deleted.
            </p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Withdraw Application Confirmation */}
      <ConfirmationDialog
        open={withdrawConfirmOpen}
        onClose={() => {
          setWithdrawConfirmOpen(false);
          setSelectedApplicationId(null);
        }}
        onConfirm={confirmWithdrawApplication}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        type="warning"
        confirmText="Withdraw"
        cancelText="Cancel"
      />

      {/* Terminate Contract Confirmation */}
      <ConfirmationDialog
        open={terminateConfirmOpen}
        onClose={() => {
          setTerminateConfirmOpen(false);
          setSelectedApplicationId(null);
        }}
        onConfirm={confirmTerminateContract}
        title="Terminate Contract"
        message="Are you sure you want to terminate this contract? This will end your assignment to this project. This action cannot be undone."
        type="danger"
        confirmText="Terminate"
        cancelText="Cancel"
      />
    </div>
  );
}

