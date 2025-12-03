/**
 * Service layer for milestone business logic
 */
import { milestoneRepository } from "@/src/repositories/milestoneRepository";
import { MilestoneI, MilestoneStatus } from "@/src/models/milestone";

export const milestoneService = {
  /**
   * Get milestones for a project
   */
  getProjectMilestones: async (projectId: string): Promise<MilestoneI[]> => {
    return milestoneRepository.getAll(projectId);
  },

  /**
   * Update milestone status with business rules
   */
  updateStatus: async (
    id: string,
    status: MilestoneStatus,
    userId: string
  ): Promise<MilestoneI> => {
    const milestone = await milestoneRepository.getById(id);

    // Business rule: Supervisor must approve before partner can release
    if (status === "RELEASED" && !milestone.supervisorGate) {
      throw new Error("Supervisor approval required before releasing funds");
    }

    // Business rule: Escrow must be funded before moving to IN_PROGRESS
    if (status === "IN_PROGRESS" && milestone.escrowStatus !== "FUNDED") {
      throw new Error("Escrow must be funded before starting milestone");
    }

    return milestoneRepository.update(id, {
      status,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Approve milestone for supervisor gate
   */
  approveForPartner: async (id: string): Promise<MilestoneI> => {
    return milestoneRepository.update(id, {
      supervisorGate: true,
      status: "PARTNER_REVIEW",
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Fund escrow for milestone
   * PRD: Partner funds milestone → escrow status changes to FUNDED
   */
  fundEscrow: async (id: string): Promise<MilestoneI> => {
    const milestone = await milestoneRepository.getById(id);

    // Business rule: Only FINALIZED milestones can have escrow funded
    if (milestone.status !== "FINALIZED") {
      throw new Error(`Cannot fund escrow. Milestone status must be FINALIZED. Current: ${milestone.status}`);
    }

    // Business rule: Escrow must not already be funded
    if (milestone.escrowStatus === "FUNDED" || milestone.escrowStatus === "HELD") {
      throw new Error("Escrow already funded for this milestone");
    }

    return milestoneRepository.update(id, {
      escrowStatus: "FUNDED",
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Partner approve and release escrow
   * PRD: Partner approves → releases escrow → payout → auto-create portfolio
   * Business rule: Supervisor must have approved first
   */
  approveAndRelease: async (id: string): Promise<MilestoneI> => {
    const milestone = await milestoneRepository.getById(id);

    // Business rule: Supervisor must approve before partner can release
    if (!milestone.supervisorGate) {
      throw new Error("Supervisor approval required before releasing escrow");
    }

    // Business rule: Milestone must be in PARTNER_REVIEW status
    if (milestone.status !== "PARTNER_REVIEW") {
      throw new Error(`Cannot release escrow. Milestone must be in PARTNER_REVIEW status. Current: ${milestone.status}`);
    }

    // Business rule: Escrow must be funded
    if (milestone.escrowStatus !== "FUNDED" && milestone.escrowStatus !== "HELD") {
      throw new Error("Escrow must be funded before releasing");
    }

    const updated = await milestoneRepository.update(id, {
      status: "RELEASED",
      escrowStatus: "RELEASED",
      updatedAt: new Date().toISOString(),
    });

    // PRD: Auto-create portfolio on milestone completion
    // Trigger portfolio creation in background
    try {
      await milestoneService.createPortfolioOnCompletion(id);
    } catch (error) {
      // Log error but don't fail the release
      console.error("Failed to create portfolio entry:", error);
    }

    return updated;
  },

  /**
   * Partner disapprove (revert RELEASED back to PARTNER_REVIEW)
   * Allows partner to undo an approval and return milestone to review state
   */
  disapproveAndRevert: async (id: string): Promise<MilestoneI> => {
    const milestone = await milestoneRepository.getById(id);

    // Business rule: Milestone must be in RELEASED status to disapprove
    if (milestone.status !== "RELEASED") {
      throw new Error(`Cannot disapprove. Milestone must be in RELEASED status. Current: ${milestone.status}`);
    }

    // Revert to PARTNER_REVIEW status
    // Keep escrow status as FUNDED (don't revert escrow)
    const updated = await milestoneRepository.update(id, {
      status: "PARTNER_REVIEW",
      updatedAt: new Date().toISOString(),
    });

    return updated;
  },

  /**
   * Auto-create portfolio entries when milestone is released/completed
   * PRD: Auto-create verified entries on milestone/project completion
   * @param milestoneId - Milestone ID
   */
  createPortfolioOnCompletion: async (milestoneId: string): Promise<void> => {
    const milestone = await milestoneRepository.getById(milestoneId);
    
    // Only create portfolio for RELEASED or COMPLETED milestones
    if (milestone.status !== "RELEASED" && milestone.status !== "COMPLETED") {
      return;
    }

    // Get project and assigned students
    const { projectService } = await import('@/src/services/projectService');
    const { applicationService } = await import('@/src/services/applicationService');
    const { portfolioService } = await import('@/src/services/portfolioService');
    
    try {
      const project = await projectService.getProjectById(milestone.projectId);
      const applications = await applicationService.getProjectApplications(milestone.projectId);
      
      // Get assigned students (students in ACCEPTED/ASSIGNED applications)
      const assignedApps = applications.filter(
        (app) => app.status === "ASSIGNED" || app.status === "ACCEPTED"
      );
      const studentIds = assignedApps.flatMap((app) => app.studentIds);
      
      if (studentIds.length > 0) {
        // Create portfolio entries for each student
        await portfolioService.createPortfolioEntry(
          milestone,
          project,
          studentIds,
          "Project Contributor", // Default role
          undefined // Rating would come from partner if available
        );
      }
    } catch (error) {
      console.error("Failed to create portfolio on milestone completion:", error);
    }
  },

  /**
   * Partner request changes on milestone
   * PRD: Partner can request changes → back to team via chat
   */
  requestChanges: async (id: string): Promise<MilestoneI> => {
    const milestone = await milestoneRepository.getById(id);

    // Business rule: Milestone must be in PARTNER_REVIEW status
    if (milestone.status !== "PARTNER_REVIEW") {
      throw new Error(`Cannot request changes. Milestone must be in PARTNER_REVIEW status. Current: ${milestone.status}`);
    }

    return milestoneRepository.update(id, {
      status: "CHANGES_REQUESTED",
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Partner mark milestone as complete
   * PRD: Partner can mark milestone as complete after releasing escrow
   * Business rule: Only RELEASED milestones can be marked as complete
   */
  markAsComplete: async (id: string): Promise<MilestoneI> => {
    console.log("[milestoneService] markAsComplete called for milestone:", id);
    
    // Update milestone status to COMPLETED
    // Backend will handle validation - don't validate here to avoid blocking UI
    const updatePayload = {
      status: "COMPLETED",
      updatedAt: new Date().toISOString(),
    };
    console.log("[milestoneService] Calling repository.update with status COMPLETED");
    console.log("[milestoneService] Update payload:", updatePayload);
    
    const updated = await milestoneRepository.update(id, updatePayload);
    console.log("[milestoneService] Milestone updated successfully:", updated);

    // Ensure portfolio is created if not already done
    try {
      await milestoneService.createPortfolioOnCompletion(id);
    } catch (error) {
      // Log error but don't fail the completion
      console.error("Failed to create portfolio entry:", error);
    }

    return updated;
  },

  /**
   * Partner unmark milestone as complete (undo)
   * Backend will handle validation - don't validate here to avoid blocking UI
   */
  unmarkAsComplete: async (id: string): Promise<MilestoneI> => {
    console.log("[milestoneService] unmarkAsComplete called for milestone:", id);
    
    // Update milestone status to RELEASED
    // Backend will handle validation - don't validate here to avoid blocking UI
    const updatePayload = {
      status: "RELEASED",
      updatedAt: new Date().toISOString(),
    };
    console.log("[milestoneService] Calling repository.update with status RELEASED");
    console.log("[milestoneService] Update payload:", updatePayload);
    
    const updated = await milestoneRepository.update(id, updatePayload);
    console.log("[milestoneService] Milestone unmarked successfully:", updated);
    return updated;
  },

  /**
   * Delete milestone
   * Business rule: Only PROPOSED or FINALIZED milestones can be deleted
   */
  deleteMilestone: async (id: string): Promise<void> => {
    const milestone = await milestoneRepository.getById(id);

    // Business rule: Only PROPOSED or FINALIZED milestones can be deleted
    // Once milestone is in progress or completed, it should not be deleted
    if (milestone.status !== "PROPOSED" && milestone.status !== "FINALIZED") {
      throw new Error(`Cannot delete milestone. Only PROPOSED or FINALIZED milestones can be deleted. Current status: ${milestone.status}`);
    }

    return milestoneRepository.delete(id);
  },
};

