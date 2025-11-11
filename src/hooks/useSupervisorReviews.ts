/**
 * Custom hook for supervisor reviews logic
 */
import { useState, useEffect } from "react";
import { MilestoneI } from "@/src/models/milestone";
import { ProjectI } from "@/src/models/project";
import { milestoneService } from "@/src/services/milestoneService";
import { projectService } from "@/src/services/projectService";
import { useToast } from "@/src/hooks/useToast";

export interface UseSupervisorReviewsResult {
  projects: ProjectI[];
  milestones: MilestoneI[];
  selectedMilestone: MilestoneI | null;
  reviewNotes: string;
  risks: string;
  progressAdjustment: number;
  loading: boolean;
  showApproveConfirm: boolean;
  showRequestChangesConfirm: boolean;
  setSelectedMilestone: (milestone: MilestoneI | null) => void;
  setReviewNotes: (notes: string) => void;
  setRisks: (risks: string) => void;
  setProgressAdjustment: (progress: number) => void;
  setShowApproveConfirm: (show: boolean) => void;
  setShowRequestChangesConfirm: (show: boolean) => void;
  handleApproveForPartner: () => Promise<void>;
  handleRequestChanges: () => Promise<void>;
}

/**
 * Hook for managing supervisor review state and logic
 */
export function useSupervisorReviews(
  userId: string | undefined,
  projectId: string | null
): UseSupervisorReviewsResult {
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [milestones, setMilestones] = useState<MilestoneI[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneI | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [risks, setRisks] = useState("");
  const [progressAdjustment, setProgressAdjustment] = useState(100);
  const [loading, setLoading] = useState(true);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRequestChangesConfirm, setShowRequestChangesConfirm] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      try {
        const allProjects = await projectService.getAllProjects();
        const supervisedProjects = allProjects.filter((p) => p.supervisorId === userId);
        setProjects(supervisedProjects);

        const projectToLoad = projectId
          ? supervisedProjects.find((p) => p.id === projectId)
          : supervisedProjects[0];

        if (projectToLoad) {
          const projectMilestones = await milestoneService.getProjectMilestones(
            projectToLoad.id
          );
          const reviewableMilestones = projectMilestones.filter(
            (m) => m.status === "SUBMITTED" || m.status === "SUPERVISOR_REVIEW"
          );
          setMilestones(reviewableMilestones);
        }
      } catch (error) {
        console.error("Failed to fetch milestones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, projectId]);

  const handleApproveForPartner = async () => {
    if (!selectedMilestone) return;

    try {
      await milestoneService.approveForPartner(selectedMilestone.id);
      setMilestones(
        milestones.map((m) =>
          m.id === selectedMilestone.id
            ? { ...m, status: "PARTNER_REVIEW", supervisorGate: true }
            : m
        )
      );
      showSuccess("Milestone approved for partner review successfully!");
      setSelectedMilestone(null);
      setReviewNotes("");
      setRisks("");
      setProgressAdjustment(100);
      setShowApproveConfirm(false);
    } catch (error) {
      console.error("Failed to approve milestone:", error);
      showError("Failed to approve milestone. Please try again.");
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedMilestone || !userId) return;

    if (!reviewNotes || reviewNotes.trim().length < 10) {
      showError(
        "Please provide detailed notes about the requested changes (at least 10 characters)"
      );
      return;
    }

    try {
      await milestoneService.updateStatus(
        selectedMilestone.id,
        "CHANGES_REQUESTED",
        userId
      );
      setMilestones(
        milestones.map((m) =>
          m.id === selectedMilestone.id ? { ...m, status: "CHANGES_REQUESTED" } : m
        )
      );
      showSuccess("Changes requested. The team will be notified.");
      setSelectedMilestone(null);
      setReviewNotes("");
      setRisks("");
      setProgressAdjustment(100);
      setShowRequestChangesConfirm(false);
    } catch (error) {
      console.error("Failed to request changes:", error);
      showError("Failed to request changes. Please try again.");
    }
  };

  return {
    projects,
    milestones,
    selectedMilestone,
    reviewNotes,
    risks,
    progressAdjustment,
    loading,
    showApproveConfirm,
    showRequestChangesConfirm,
    setSelectedMilestone,
    setReviewNotes,
    setRisks,
    setProgressAdjustment,
    setShowApproveConfirm,
    setShowRequestChangesConfirm,
    handleApproveForPartner,
    handleRequestChanges,
  };
}




