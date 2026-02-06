"use client";

import React, { useEffect, useState } from "react";
import Card from "@/src/components/core/Card";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import { GroupI } from "@/src/models/group";
import ScreeningApplicationCard from "@/src/components/screen/university-admin/screening/ScreeningApplicationCard";
import ScreeningApplicationDetailsModal from "@/src/components/screen/university-admin/screening/ScreeningApplicationDetailsModal";
import ScoreApplicationModal from "@/src/components/screen/university-admin/screening/ScoreApplicationModal";
import IssueOfferModal from "@/src/components/screen/university-admin/IssueOfferModal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { useAuthStore } from "@/src/store";
import { useToast } from "@/src/hooks/useToast";
import DashboardLoading from "@/src/components/core/DashboardLoading";

/**
 * University Admin Screening - screen and score project applications
 */
export default function UniversityAdminScreening() {
  const { user, organization } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [projects, setProjects] = useState<Record<string, ProjectI>>({});
  const [users, setUsers] = useState<Record<string, UserI>>({});
  const [groups, setGroups] = useState<Record<string, GroupI>>({});
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [scoringModalOpen, setScoringModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationI | null>(null);
  const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<ApplicationI | null>(null);

  // Confirmation modals for screening actions
  const [shortlistConfirmOpen, setShortlistConfirmOpen] = useState(false);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedApplicationForAction, setSelectedApplicationForAction] = useState<ApplicationI | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  // Store previous status for undo reject
  const [rejectedApplicationPreviousStatus, setRejectedApplicationPreviousStatus] = useState<Record<number, string>>({});
  const toast = useToast();

  /**
   * Load data from backend
   */
  const loadData = async () => {
    try {
      // For university-admin, use organization.id or user.orgId
      const universityId = organization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);
      if (!universityId) {
        setLoading(false);
        return;
      }

      // Dynamically import services to avoid server/client mismatch
      const [
        { applicationRepository },
        { projectService },
        { userRepository },
        { groupRepository },
      ] = await Promise.all([
        import("@/src/repositories/applicationRepository"),
        import("@/src/services/projectService"),
        import("@/src/repositories/userRepository"),
        import("@/src/repositories/groupRepository"),
      ]);

      // Load all data from backend
      const [allApplications, allProjects, allUsers, allGroups] = await Promise.all([
        applicationRepository.getAll(),
        projectService.getAllProjects(),
        userRepository.getAll(),
        groupRepository.getAll(),
      ]);

      // Filter projects for this university
      const numericUniversityId = typeof universityId === 'string' ? parseInt(universityId, 10) : universityId;
      const universityProjects = allProjects.filter(
        (p) => {
          const projectUniId = typeof p.universityId === 'string' ? parseInt(p.universityId, 10) : p.universityId;
          return projectUniId === numericUniversityId;
        }
      );

      // Filter applications for university projects
      const universityProjectIds = new Set(universityProjects.map((p) => p.id.toString()));
      const universityApplications = allApplications.filter(
        (a) => universityProjectIds.has(a.projectId.toString())
      );
      setApplications(universityApplications);

      const projectsMap: Record<string, ProjectI> = {};
      universityProjects.forEach((p) => {
        projectsMap[p.id.toString()] = p;
      });
      setProjects(projectsMap);

      // Load users for avatars
      const usersMap: Record<string, UserI> = {};
      allUsers.forEach((user) => {
        usersMap[user.id.toString()] = user;
      });
      setUsers(usersMap);

      // Load groups for group applications
      const groupsMap: Record<string, GroupI> = {};
      allGroups.forEach((group) => {
        groupsMap[group.id.toString()] = group;
      });
      setGroups(groupsMap);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // For university-admin, use organization.id or user.orgId
    const universityId = organization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);
    if (universityId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.orgId, user?.universityId, organization?.id]);

  /**
   * Open scoring modal for an application
   */
  const handleScoreClick = (application: ApplicationI) => {
    setSelectedApplication(application);
    setScoringModalOpen(true);
  };

  /**
   * Get students for an application
   */
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

  /**
   * Get group for an application
   */
  const getGroupForApplication = (application: ApplicationI): GroupI | undefined => {
    if (application.applicantType === "GROUP" && application.groupId) {
      return groups[application.groupId.toString()];
    }
    return undefined;
  };

  /**
   * Open details modal
   */
  const handleViewDetails = (application: ApplicationI) => {
    setSelectedApplicationForDetails(application);
    setIsDetailsModalOpen(true);
  };

  /**
   * Handle scoring submission - update application score (advisory)
   * Note: Scoring is advisory for supervisors/partners. Core actions are shortlist/reject/offer.
   */
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

      // Preserve existing score data or create new score structure
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

      setApplications(
        applications.map((a: any) => {
          const aId = (a as any).ID || a.id;
          return aId === numericAppId ? updatedApp : a;
        })
      );
      toast.showSuccess("Application scored successfully");
      setScoringModalOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error("Failed to update application score:", error);
      toast.showError(error instanceof Error ? error.message : "Failed to update score");
    }
  };

  /**
   * Show confirmation modals for screening actions
   */
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

  /**
   * Confirmation handlers that make the actual API calls
   */
  const confirmShortlist = async () => {
    if (!selectedApplicationForAction) return;

    setIsProcessingAction(true);
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      const updatedApp = await applicationRepository.shortlist(selectedApplicationForAction.id);
      setApplications(
        applications.map((a) => (a.id === selectedApplicationForAction.id ? updatedApp : a))
      );
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

    setIsProcessingAction(true);
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");

      // Store previous status for undo
      const previousStatus = selectedApplicationForAction.status;
      const appId = selectedApplicationForAction.id;
      setRejectedApplicationPreviousStatus(prev => ({
        ...prev,
        [appId]: previousStatus
      }));

      const updatedApp = await applicationRepository.reject(appId);
      setApplications(
        applications.map((a) => (a.id === appId ? updatedApp : a))
      );
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
    setIsProcessingAction(true);
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      const appId = application.id;

      // Get previous status (default to SUBMITTED if not found)
      const previousStatus = rejectedApplicationPreviousStatus[appId] || "SUBMITTED";

      const updatedApp = await applicationRepository.undoReject(appId, previousStatus);
      setApplications(
        applications.map((a) => (a.id === appId ? updatedApp : a))
      );

      // Remove from previous status tracking
      setRejectedApplicationPreviousStatus(prev => {
        const newState = { ...prev };
        delete newState[appId];
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

  const confirmOffer = async () => {
    if (!selectedApplicationForAction) {
      return;
    }

    setIsProcessingAction(true);
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      const appId = selectedApplicationForAction.id;

      const updatedApp = await applicationRepository.offer(appId);

      setApplications(
        applications.map((a) => (a.id === appId ? updatedApp : a))
      );

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

  const filteredApplications =
    selectedBucket === "all"
      ? applications
      : applications.filter((app) => app.status === selectedBucket);

  const buckets = {
    all: applications.length,
    SUBMITTED: applications.filter((a) => a.status === "SUBMITTED").length,
    SHORTLISTED: applications.filter((a) => a.status === "SHORTLISTED").length,
    OFFERED: applications.filter((a) => a.status === "OFFERED").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
  };

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Screening & Shortlisting</h1>
        <p className="text-[0.875rem] opacity-60">Review and manage project applications</p>
      </div>

      {/* Bucket Tabs */}
      <Card className="mb-8">
        <div className="flex gap-4 border-b border-custom mb-6 overflow-x-auto">
          {Object.entries(buckets).map(([bucket, count]) => (
            <button
              key={bucket}
              onClick={() => setSelectedBucket(bucket)}
              className={`pb-2 px-4 whitespace-nowrap ${selectedBucket === bucket
                  ? "border-b-2 border-primary text-primary font-[600]"
                  : "text-[0.875rem] opacity-60"
                }`}
            >
              {bucket.charAt(0).toUpperCase() + bucket.slice(1)} ({count})
            </button>
          ))}
        </div>

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[0.875rem] opacity-60">
              No applications in this bucket
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <ScreeningApplicationCard
                key={application.id}
                application={application}
                project={projects[application.projectId.toString()]}
                onScore={handleScoreClick}
                onViewDetails={handleViewDetails}
                onShortlist={handleShortlist}
                onReject={handleReject}
                onOffer={handleOffer}
                onUndoReject={handleUndoReject}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Score Application Modal */}
      <ScoreApplicationModal
        open={scoringModalOpen}
        application={selectedApplication}
        project={selectedApplication ? projects[selectedApplication.projectId.toString()] : undefined}
        onClose={() => {
          setScoringModalOpen(false);
          setSelectedApplication(null);
        }}
        onSubmit={async (applicationId: string, score: number) => {
          await handleScoreSubmit(applicationId, score);
          // Close modal after successful submission
          setScoringModalOpen(false);
          setSelectedApplication(null);
        }}
      />

      {/* Details Modal */}
      <ScreeningApplicationDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedApplicationForDetails(null);
        }}
        application={selectedApplicationForDetails}
        project={selectedApplicationForDetails ? projects[selectedApplicationForDetails.projectId.toString()] : undefined}
        students={selectedApplicationForDetails ? getStudentsForApplication(selectedApplicationForDetails) : []}
        group={selectedApplicationForDetails ? getGroupForApplication(selectedApplicationForDetails) : undefined}
        onScore={handleScoreClick}
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

      {/* Assign Group Modal */}
      <IssueOfferModal
        open={offerModalOpen}
        application={selectedApplicationForAction}
        projects={projects}
        onClose={() => {
          setOfferModalOpen(false);
          setSelectedApplicationForAction(null);
        }}
        onSubmit={confirmOffer}
      />
    </div>
  );
}

