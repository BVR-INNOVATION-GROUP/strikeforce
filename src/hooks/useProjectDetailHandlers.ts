/**
 * Custom hook for project detail page handlers
 */
import { useState } from "react";
import { MilestoneI } from "@/src/models/milestone";
import { milestoneService } from "@/src/services/milestoneService";

export interface UseProjectDetailHandlersParams {
  projectId: string;
  orgId: string | undefined;
  milestones: MilestoneI[];
  setMilestones: (milestones: MilestoneI[]) => void;
}

export interface ProjectDetailHandlers {
  selectedMilestone: MilestoneI | null;
  setSelectedMilestone: (milestone: MilestoneI | null) => void;
  handleApproveAndRelease: (milestoneId: string) => Promise<void>;
  handleDisapprove: (milestoneId: string) => Promise<void>;
  handleRequestChanges: (milestoneId: string) => Promise<void>;
}

/**
 * Hook for managing project detail page handlers
 */
export function useProjectDetailHandlers({
  projectId,
  orgId,
  milestones,
  setMilestones,
}: UseProjectDetailHandlersParams): ProjectDetailHandlers {
  const [selectedMilestone, setSelectedMilestone] =
    useState<MilestoneI | null>(null);

  const handleApproveAndRelease = async (milestoneId: string) => {
    await milestoneService.approveAndRelease(milestoneId);
    const projectMilestones = await milestoneService.getProjectMilestones(
      projectId
    );
    setMilestones(projectMilestones);
  };

  const handleDisapprove = async (milestoneId: string) => {
    await milestoneService.disapproveAndRevert(milestoneId);
    const projectMilestones = await milestoneService.getProjectMilestones(
      projectId
    );
    setMilestones(projectMilestones);
  };

  const handleRequestChanges = async (milestoneId: string) => {
    await milestoneService.requestChanges(milestoneId);
    const projectMilestones = await milestoneService.getProjectMilestones(
      projectId
    );
    setMilestones(projectMilestones);
  };

  return {
    selectedMilestone,
    setSelectedMilestone,
    handleApproveAndRelease,
    handleDisapprove,
    handleRequestChanges,
  };
}



