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
import RequestSupervisorModal from "@/src/components/screen/student/supervisor-request/RequestSupervisorModal";
import UniversityAdminProjectActions from "@/src/components/screen/university-admin/UniversityAdminProjectActions";
import ScreeningApplicationDetailsModal from "@/src/components/screen/university-admin/screening/ScreeningApplicationDetailsModal";
import ScoreApplicationModal from "@/src/components/screen/university-admin/screening/ScoreApplicationModal";
import IssueOfferModal from "@/src/components/screen/university-admin/IssueOfferModal";
import { useAuthStore } from "@/src/store";
import { UserI } from "@/src/models/user";
import { GroupI } from "@/src/models/group";
import { ApplicationI } from "@/src/models/application";
import { useProjectDetailPage } from "@/src/hooks/useProjectDetailPage";
import { formatDateLong } from "@/src/utils/dateFormatters";
import { useToast } from "@/src/hooks/useToast";
import { notificationService } from "@/src/services/notificationService";
import { useSupervisorRequestForm } from "@/src/hooks/useSupervisorRequestForm";
import { useSupervisorRequestData } from "@/src/hooks/useSupervisorRequestData";
import { projectService } from "@/src/services/projectService";

export interface Props {
  projectId: string;
}

/**
 * Unified Project Details Page
 * Adapts UI and functionality based on user role automatically
 */
export default function ProjectDetailsPage({ projectId }: Props) {
  const { user, _hasHydrated, organization } = useAuthStore();
  const router = useRouter();
  const toast = useToast();
  const [userLoading, setUserLoading] = useState(true);
  const [isRequestSupervisorModalOpen, setIsRequestSupervisorModalOpen] = useState(false);

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
    setProjectData,
    setApplications,
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

  // Supervisor request data and form (only for students)
  // Fetch supervisors by project's department
  const [projectSupervisors, setProjectSupervisors] = useState<any[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);

  // Load supervisors for the project's department when project is loaded
  useEffect(() => {
    const loadProjectSupervisors = async () => {
      if (!projectData?.departmentId || user?.role !== "student") {
        return;
      }

      try {
        setLoadingSupervisors(true);
        const { api } = await import("@/src/api/client");
        const supervisorsData = await api.get<Array<{
          ID?: number;
          id?: number;
          userId?: number;
          user: any & { ID?: number };
          departmentId: number;
        }>>(`/api/v1/supervisors?dept=${projectData.departmentId}`);

        // Map to UserI format
        const supervisorUsers = supervisorsData.map((s) => {
          const user = s.user;
          return {
            ...user,
            id: user.ID || user.id,
          };
        });
        setProjectSupervisors(supervisorUsers);
      } catch (error) {
        console.error("Failed to load supervisors:", error);
        setProjectSupervisors([]);
      } finally {
        setLoadingSupervisors(false);
      }
    };

    loadProjectSupervisors();
  }, [projectData?.departmentId, user?.role]);

  // Load users and groups for screening (university admin only)
  useEffect(() => {
    const loadScreeningData = async () => {
      if (user?.role !== "university-admin") return;

      try {
        const [
          { userRepository },
          { groupRepository },
        ] = await Promise.all([
          import("@/src/repositories/userRepository"),
          import("@/src/repositories/groupRepository"),
        ]);

        const [allUsers, allGroups] = await Promise.all([
          userRepository.getAll(),
          groupRepository.getAll(),
        ]);

        const usersMap: Record<string, UserI> = {};
        allUsers.forEach((user) => {
          usersMap[user.id.toString()] = user;
        });
        setUsers(usersMap);

        const groupsMap: Record<string, GroupI> = {};
        allGroups.forEach((group) => {
          groupsMap[group.id.toString()] = group;
        });
        setGroups(groupsMap);
      } catch (error) {
        console.error("Failed to load screening data:", error);
      }
    };

    loadScreeningData();
  }, [user?.role]);

  const {
    formData,
    requestMessage,
    errors,
    submitting,
    setFormData,
    setRequestMessage,
    clearError,
    handleSubmitRequest,
    reset,
  } = useSupervisorRequestForm(isRequestSupervisorModalOpen);

  // Set project ID from path when modal opens
  useEffect(() => {
    if (isRequestSupervisorModalOpen && projectId) {
      setFormData({ ...formData, projectId });
    }
  }, [isRequestSupervisorModalOpen, projectId]);

  // Handle supervisor request submission
  const handleSubmitSupervisorRequest = async () => {
    if (!user) return;
    try {
      await handleSubmitRequest(user.id.toString(), async (newRequest) => {
        setIsRequestSupervisorModalOpen(false);
        toast.showSuccess("Supervisor request submitted successfully");
        reset();
      });
    } catch (error) {
      console.error("Failed to submit supervisor request:", error);
      // Error already shown in hook
    }
  };

  // Determine if user is project owner (partner who created the project)
  // Normalize IDs to strings for comparison
  const userPartnerId = user?.id !== undefined ? String(user.id) : undefined;
  const projectPartnerId = projectData?.partnerId !== undefined ? String(projectData.partnerId) : undefined;
  const isProjectOwner =
    user?.role === "partner" && userPartnerId === projectPartnerId && projectPartnerId !== undefined;

  // Check if project belongs to university admin's organization
  const userUniversityId = user?.orgId !== undefined && user.orgId !== null && user.orgId !== 0
    ? String(user.orgId)
    : (organization?.id !== undefined && organization.id !== null && organization.id !== 0
      ? String(organization.id)
      : undefined);
  const projectUniversityId = projectData?.universityId !== undefined && projectData.universityId !== null && projectData.universityId !== 0
    ? String(projectData.universityId)
    : undefined;
  const isProjectInUniversity =
    user?.role === "university-admin" &&
    userUniversityId &&
    projectUniversityId &&
    userUniversityId === projectUniversityId;

  // Project owners (partners) and super-admins can edit projects
  const canEditProject = (user?.role === "partner" && isProjectOwner) || user?.role === "super-admin";
  // Project owners (partners) and super-admins can delete projects
  const canDeleteProject = (user?.role === "partner" && isProjectOwner) || user?.role === "super-admin";
  // Project owners (partners) and super-admins can see quick actions
  const canSeeQuickActions =
    (user?.role === "partner" && isProjectOwner) ||
    user?.role === "super-admin";
  // Only project owner (partner) can manage applications
  const canManageApplications = user?.role === "partner" && isProjectOwner;
  // Only partners who own the project and super-admins can add milestones
  const canAddMilestone =
    (user?.role === "partner" && isProjectOwner) ||
    user?.role === "super-admin";

  // Only partners who own the project and super-admins can edit/delete milestones
  const canEditDeleteMilestone =
    (user?.role === "partner" && isProjectOwner) ||
    user?.role === "super-admin";

  // University admins can only approve/disapprove/suspend projects (for their university's projects)
  const canManageProjectStatus = user?.role === "university-admin" && isProjectInUniversity;

  // Handle edit milestone
  const handleEditMilestone = (milestoneId: string) => {
    modals.openEditMilestoneModal(milestoneId);
  };

  const openDeleteMilestoneConfirm = (milestoneId: string) => {
    modals.openDeleteMilestoneConfirm(milestoneId);
  };

  // University admin project status management
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleApproveProject = async () => {
    if (!projectId || !projectData) return;
    setIsUpdatingStatus(true);
    try {
      const updatedProject = await projectService.updateProjectStatus(projectId, "published");
      // Update local project data
      setProjectData(updatedProject);
      toast.showSuccess("Project approved successfully");
      // Reload page to refresh all data
      router.refresh();
    } catch (error) {
      console.error("Failed to approve project:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to approve project");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDisapproveProject = async () => {
    if (!projectId || !projectData) return;
    setIsUpdatingStatus(true);
    try {
      const updatedProject = await projectService.updateProjectStatus(projectId, "draft");
      // Update local project data
      setProjectData(updatedProject);
      toast.showSuccess("Project disapproved successfully");
      // Reload page to refresh all data
      router.refresh();
    } catch (error) {
      console.error("Failed to disapprove project:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to disapprove project");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSuspendProject = async () => {
    if (!projectId || !projectData) return;
    setIsUpdatingStatus(true);
    try {
      const updatedProject = await projectService.updateProjectStatus(projectId, "on-hold");
      // Update local project data
      setProjectData(updatedProject);
      toast.showSuccess("Project suspended successfully");
      // Reload page to refresh all data
      router.refresh();
    } catch (error) {
      console.error("Failed to suspend project:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to suspend project");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle student actions
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
  const [terminateConfirmOpen, setTerminateConfirmOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  // University admin screening state
  const [scoringModalOpen, setScoringModalOpen] = useState(false);
  const [isScreeningDetailsModalOpen, setIsScreeningDetailsModalOpen] = useState(false);
  const [selectedApplicationForScoring, setSelectedApplicationForScoring] = useState<ApplicationI | null>(null);
  const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<ApplicationI | null>(null);
  const [users, setUsers] = useState<Record<string, UserI>>({});
  const [groups, setGroups] = useState<Record<string, GroupI>>({});

  // Confirmation modals for screening actions
  const [shortlistConfirmOpen, setShortlistConfirmOpen] = useState(false);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedApplicationForAction, setSelectedApplicationForAction] = useState<ApplicationI | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  // Store previous status for undo reject
  const [rejectedApplicationPreviousStatus, setRejectedApplicationPreviousStatus] = useState<Record<number, string>>({});

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

  // University admin screening handlers
  const handleScoreClick = (application: ApplicationI) => {
    setSelectedApplicationForScoring(application);
    setScoringModalOpen(true);
  };

  const handleViewScreeningDetails = (application: ApplicationI) => {
    setSelectedApplicationForDetails(application);
    setIsScreeningDetailsModalOpen(true);
  };

  const getStudentsForApplication = (application: ApplicationI): UserI[] => {
    if (application.applicantType === "GROUP" && application.groupId) {
      const group = groups[application.groupId.toString()];
      if (group) {
        const memberIds = [...(group.memberIds || []), group.leaderId].filter(Boolean);
        return memberIds.map((id) => users[id.toString()]).filter(Boolean);
      }
    } else {
      return application.studentIds.map((id) => users[id.toString()]).filter(Boolean);
    }
    return [];
  };

  const getGroupForApplication = (application: ApplicationI): GroupI | undefined => {
    if (application.applicantType === "GROUP" && application.groupId) {
      return groups[application.groupId.toString()];
    }
    return undefined;
  };

  const handleScoreSubmit = async (applicationId: string, score: number) => {
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      const numericAppId = typeof applicationId === 'string' ? parseInt(applicationId, 10) : applicationId;
      if (isNaN(numericAppId)) {
        toast.showError("Invalid application ID");
        return;
      }

      // Find the application - handle both 'id' and 'ID' formats
      const app = applications.find((a: any) => {
        const appId = (a as any).ID || a.id;
        return appId?.toString() === applicationId || appId === numericAppId;
      });

      if (!app) {
        toast.showError("Application not found");
        return;
      }

      const existingScore = (app as any).score;
      const appId = (app as any).ID || (app as any).id;

      const updatedApp = await applicationRepository.score(numericAppId, {
        applicationId: appId,
        autoScore: existingScore?.autoScore || 70,
        manualSupervisorScore: score,
        finalScore: score,
        skillMatch: existingScore?.skillMatch || 80,
        portfolioScore: existingScore?.portfolioScore || 75,
        ratingScore: existingScore?.ratingScore || 80,
        onTimeRate: existingScore?.onTimeRate || 0.85,
        reworkRate: existingScore?.reworkRate || 0.1,
      });

      // Update the application in the local state
      const updatedApplications = applications.map((a: any) => {
        const aId = (a as any).ID || a.id;
        return aId === numericAppId ? updatedApp : a;
      });
      setApplications(updatedApplications);

      toast.showSuccess("Application scored successfully");
      setScoringModalOpen(false);
      setSelectedApplicationForScoring(null);
    } catch (error) {
      console.error("Failed to update application score:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to update score");
    }
  };

  // Show confirmation modals for screening actions
  const handleShortlist = (application: ApplicationI) => {
    setSelectedApplicationForAction(application);
    setShortlistConfirmOpen(true);
  };

  const handleReject = (application: ApplicationI) => {
    setSelectedApplicationForAction(application);
    setRejectConfirmOpen(true);
  };

  const handleOffer = (application: ApplicationI) => {
    setSelectedApplicationForAction(application);
    setOfferModalOpen(true);
  };

  // Confirmation handlers that make the actual API calls
  const confirmShortlist = async () => {
    if (!selectedApplicationForAction) return;

    // Extract ID - handle both 'id' and 'ID' (backend might return either)
    const applicationId = (selectedApplicationForAction as any).ID || selectedApplicationForAction.id;
    if (!applicationId) {
      toast.showError("Invalid application: missing ID");
      return;
    }

    setIsProcessingAction(true);
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      // Ensure ID is a number
      const numericId = typeof applicationId === 'string' ? parseInt(applicationId, 10) : applicationId;
      if (isNaN(numericId)) {
        throw new Error("Invalid application ID");
      }
      const updatedApp = await applicationRepository.shortlist(numericId);

      // Update the application in the local state
      const updatedApplications = applications.map((app: any) => {
        const appId = (app as any).ID || app.id;
        return appId === numericId ? updatedApp : app;
      });
      setApplications(updatedApplications);

      toast.showSuccess("Application shortlisted successfully");
      setShortlistConfirmOpen(false);
      setSelectedApplicationForAction(null);
    } catch (error) {
      console.error("Failed to shortlist application:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to shortlist application");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedApplicationForAction) return;

    // Extract ID - handle both 'id' and 'ID' (backend might return either)
    const applicationId = (selectedApplicationForAction as any).ID || selectedApplicationForAction.id;
    if (!applicationId) {
      toast.showError("Invalid application: missing ID");
      return;
    }

    setIsProcessingAction(true);
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      // Ensure ID is a number
      const numericId = typeof applicationId === 'string' ? parseInt(applicationId, 10) : applicationId;
      if (isNaN(numericId)) {
        throw new Error("Invalid application ID");
      }

      // Store previous status for undo
      const previousStatus = selectedApplicationForAction.status;
      setRejectedApplicationPreviousStatus(prev => ({
        ...prev,
        [numericId]: previousStatus
      }));

      const updatedApp = await applicationRepository.reject(numericId);

      // Update the application in the local state
      const updatedApplications = applications.map((app: any) => {
        const appId = (app as any).ID || app.id;
        return appId === numericId ? updatedApp : app;
      });
      setApplications(updatedApplications);

      toast.showSuccess("Application rejected successfully");
      setRejectConfirmOpen(false);
      setSelectedApplicationForAction(null);
    } catch (error) {
      console.error("Failed to reject application:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to reject application");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleUndoReject = async (application: ApplicationI) => {
    // Extract ID - handle both 'id' and 'ID' (backend might return either)
    const applicationId = (application as any).ID || application.id;
    if (!applicationId) {
      toast.showError("Invalid application: missing ID");
      return;
    }

    setIsProcessingAction(true);
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      // Ensure ID is a number
      const numericId = typeof applicationId === 'string' ? parseInt(applicationId, 10) : applicationId;
      if (isNaN(numericId)) {
        throw new Error("Invalid application ID");
      }

      // Get previous status (default to SUBMITTED if not found)
      const previousStatus = rejectedApplicationPreviousStatus[numericId] || "SUBMITTED";

      const updatedApp = await applicationRepository.undoReject(numericId, previousStatus);

      // Update the application in the local state
      const updatedApplications = applications.map((app: any) => {
        const appId = (app as any).ID || app.id;
        return appId === numericId ? updatedApp : app;
      });
      setApplications(updatedApplications);

      // Remove from previous status tracking
      setRejectedApplicationPreviousStatus(prev => {
        const newState = { ...prev };
        delete newState[numericId];
        return newState;
      });

      toast.showSuccess("Rejection undone successfully");
    } catch (error) {
      console.error("Failed to undo reject:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to undo reject");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSendOffer = async () => {
    if (!selectedApplicationForAction) return;

    // Extract ID - handle both 'id' and 'ID' (backend might return either)
    const applicationId = (selectedApplicationForAction as any).ID || selectedApplicationForAction.id;
    if (!applicationId) {
      toast.showError("Invalid application: missing ID");
      return;
    }

    setIsProcessingAction(true);
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      // Ensure ID is a number
      const numericId = typeof applicationId === 'string' ? parseInt(applicationId, 10) : applicationId;
      if (isNaN(numericId)) {
        throw new Error("Invalid application ID");
      }

      const updatedApp = await applicationRepository.offer(numericId);

      // Update the application in the local state
      const updatedApplications = applications.map((app: any) => {
        const appId = (app as any).ID || app.id;
        return appId === numericId ? updatedApp : app;
      });
      setApplications(updatedApplications);

      toast.showSuccess("Group assigned to project successfully!");
      setOfferModalOpen(false);
      setSelectedApplicationForAction(null);
    } catch (error) {
      console.error("Failed to assign group:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to assign group");
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (userLoading || loading || !project) {
    return <ProjectDetailSkeleton />;
  }

  // Note: Students can view all projects, but can only apply to projects from their university
  // This restriction is handled in the application form, not here

  return (
    <div className="w-full flex flex-col h-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 overflow-y-auto">
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
            onAddMilestone={canAddMilestone ? modals.openMilestoneModal : undefined}
            onEditMilestone={canEditDeleteMilestone ? handleEditMilestone : undefined}
            onDeleteMilestone={canEditDeleteMilestone ? openDeleteMilestoneConfirm : undefined}
            onApproveAndRelease={handleApproveAndRelease}
            onDisapprove={handleDisapprove}
            onRequestChanges={handleRequestChanges}
            onMarkAsComplete={handleMarkAsComplete}
            onUnmarkAsComplete={handleUnmarkAsComplete}
            userRole={user?.role}
            isProjectOwner={isProjectOwner}
            canEditProject={canEditProject}
            currentUserId={user?.id}
            // University admin screening props (partners can view but not act)
            projectData={projectData}
            onScore={user?.role === "university-admin" ? handleScoreClick : undefined}
            onViewScreeningDetails={(user?.role === "university-admin" || user?.role === "partner") ? handleViewScreeningDetails : undefined}
            onShortlist={user?.role === "university-admin" ? handleShortlist : undefined}
            onRejectScreening={user?.role === "university-admin" ? handleReject : undefined}
            onOffer={user?.role === "university-admin" ? handleOffer : undefined}
            onUndoReject={user?.role === "university-admin" ? handleUndoReject : undefined}
          />
        </div>

        {/* Sidebar - 1 column */}
        <div className="flex flex-col gap-6 overflow-y-auto overflow-x-hidden pr-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
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
            onReassignProject={user?.role === "university-admin" && isProjectInUniversity ? modals.openReassignProjectModal : undefined}
            onDeleteProject={canDeleteProject ? modals.openDeleteConfirm : undefined}
            onRequestSupervisor={user?.role === "student" ? () => {
              // Pre-select the current project
              setFormData({ ...formData, projectId: projectId });
              setIsRequestSupervisorModalOpen(true);
            } : undefined}
            userRole={user?.role}
            isProjectOwner={isProjectOwner}
            canEditProject={canEditProject}
            canSeeQuickActions={canSeeQuickActions || user?.role === "student"}
          />

          {/* University Admin Actions */}
          {canManageProjectStatus && projectData && (
            <UniversityAdminProjectActions
              projectStatus={projectData.status || project?.status || "pending"}
              onApprove={handleApproveProject}
              onDisapprove={handleDisapproveProject}
              onSuspend={handleSuspendProject}
              isProcessing={isUpdatingStatus}
            />
          )}
        </div>
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
            ? `Are you sure you want to accept ${project?.applications.find(
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
            ? `Are you sure you want to reject ${project?.applications.find(
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

      {/* Shortlist Confirmation */}
      <ConfirmationDialog
        open={shortlistConfirmOpen}
        onClose={() => {
          setShortlistConfirmOpen(false);
          setSelectedApplicationForAction(null);
        }}
        onConfirm={confirmShortlist}
        title="Shortlist Application"
        message={
          selectedApplicationForAction
            ? `Are you sure you want to shortlist this application? The applicant will be notified and can receive an offer.`
            : ""
        }
        type="info"
        confirmText="Shortlist"
        cancelText="Cancel"
        loading={isProcessingAction}
      />

      {/* Reject Confirmation */}
      <ConfirmationDialog
        open={rejectConfirmOpen}
        onClose={() => {
          setRejectConfirmOpen(false);
          setSelectedApplicationForAction(null);
        }}
        onConfirm={confirmReject}
        title="Reject Application"
        message={
          selectedApplicationForAction
            ? `Are you sure you want to reject this application? This action cannot be undone and the applicant will be notified.`
            : ""
        }
        type="warning"
        confirmText="Reject"
        cancelText="Cancel"
        loading={isProcessingAction}
      />

      {/* Issue Offer Modal */}
      {user?.role === "university-admin" && (
        <IssueOfferModal
          open={offerModalOpen}
          application={selectedApplicationForAction}
          projects={projectData ? { [projectId]: projectData } : {}}
          onClose={() => {
            setOfferModalOpen(false);
            setSelectedApplicationForAction(null);
          }}
          onSubmit={handleSendOffer}
        />
      )}

      {/* Request Supervisor Modal (only for students) */}
      {user?.role === "student" && (
        <RequestSupervisorModal
          open={isRequestSupervisorModalOpen}
          projects={[]} // No project selection needed - using project from path
          supervisors={projectSupervisors || []}
          selectedProject={projectId} // Use project ID from path
          selectedSupervisor={formData.supervisorId}
          requestMessage={requestMessage}
          errors={errors}
          submitting={submitting}
          onClose={() => {
            setIsRequestSupervisorModalOpen(false);
            reset();
          }}
          onProjectChange={() => { }} // Disabled - project is from path
          onSupervisorChange={(supervisorId) => {
            setFormData({ ...formData, supervisorId });
            clearError("supervisor");
          }}
          onMessageChange={setRequestMessage}
          onClearError={clearError}
          onSubmit={handleSubmitSupervisorRequest}
        />
      )}

      {/* University Admin Screening Modals */}
      {user?.role === "university-admin" && (
        <ScoreApplicationModal
          open={scoringModalOpen}
          application={selectedApplicationForScoring}
          project={projectData}
          onClose={() => {
            setScoringModalOpen(false);
            setSelectedApplicationForScoring(null);
          }}
          onSubmit={async (applicationId: string, score: number) => {
            await handleScoreSubmit(applicationId, score);
            // Close modal after successful submission
            setScoringModalOpen(false);
            setSelectedApplicationForScoring(null);
          }}
        />
      )}

      {/* Screening Details Modal (visible to both university-admin and partner) */}
      {(user?.role === "university-admin" || user?.role === "partner") && (
        <ScreeningApplicationDetailsModal
          open={isScreeningDetailsModalOpen}
          onClose={() => {
            setIsScreeningDetailsModalOpen(false);
            setSelectedApplicationForDetails(null);
          }}
          application={selectedApplicationForDetails}
          project={projectData}
          students={selectedApplicationForDetails ? getStudentsForApplication(selectedApplicationForDetails) : []}
          group={selectedApplicationForDetails ? getGroupForApplication(selectedApplicationForDetails) : undefined}
          onScore={user?.role === "university-admin" ? handleScoreClick : undefined}
        />
      )}
    </div>
  );
}

