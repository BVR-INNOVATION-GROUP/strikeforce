/**
 * Utility functions for determining role-based permissions for milestone actions
 */
import { UserRole } from "@/src/models/user";
import { MilestoneI, MilestoneStatus } from "@/src/models/milestone";

export interface MilestonePermissions {
  canEdit: boolean; // Can edit milestone details (title, scope, dueDate, amount)
  canAdd: boolean; // Can create new milestones
  canApproveAndRelease: boolean; // Can approve and release escrow (partner only, after supervisor approval)
  canDisapprove: boolean; // Can disapprove milestone (partner only, revert RELEASED to PARTNER_REVIEW)
  canRequestChanges: boolean; // Can request changes on milestone (partner only)
  canFundEscrow: boolean; // Can fund escrow for milestone
  canSubmit: boolean; // Can submit work for milestone (student only)
  canDispute: boolean; // Can raise dispute on milestone
  canMarkAsComplete: boolean; // Can mark milestone as complete (partner only, after release)
  canUnmarkAsComplete: boolean; // Can unmark milestone as complete (partner only, undo action)
}

/**
 * Determine what actions a user can perform on a milestone based on their role and milestone status
 * @param userRole - The role of the current user
 * @param milestone - The milestone to check permissions for
 * @param isProjectOwner - Whether the user owns the project (for partner role)
 * @returns Object with boolean flags for each permission
 */
export function getMilestonePermissions(
  userRole: UserRole | undefined,
  milestone: MilestoneI | undefined,
  isProjectOwner: boolean = false
): MilestonePermissions {
  // Default: no permissions if no role
  if (!userRole) {
    return {
      canEdit: false,
      canAdd: false,
      canApproveAndRelease: false,
      canDisapprove: false,
      canRequestChanges: false,
      canFundEscrow: false,
      canSubmit: false,
      canDispute: false,
      canMarkAsComplete: false,
      canUnmarkAsComplete: false,
    };
  }

  // If milestone is not provided, still allow basic permissions for project owners
  if (!milestone) {
    if (userRole === "partner" && isProjectOwner) {
      return {
        canEdit: true, // Allow editing if milestone data is missing (will be loaded)
        canAdd: true,
        canApproveAndRelease: false,
        canDisapprove: false,
        canRequestChanges: false,
        canFundEscrow: false,
        canSubmit: false,
        canDispute: false,
        canMarkAsComplete: false,
        canUnmarkAsComplete: false,
      };
    }
    if (userRole === "super-admin") {
      return {
        canEdit: true,
        canAdd: true,
        canApproveAndRelease: false,
        canDisapprove: false,
        canRequestChanges: false,
        canFundEscrow: false,
        canSubmit: false,
        canDispute: false,
        canMarkAsComplete: false,
        canUnmarkAsComplete: false,
      };
    }
    return {
      canEdit: false,
      canAdd: false,
      canApproveAndRelease: false,
      canDisapprove: false,
      canRequestChanges: false,
      canFundEscrow: false,
      canSubmit: false,
      canDispute: false,
      canMarkAsComplete: false,
      canUnmarkAsComplete: false,
    };
  }

  const status = milestone.status as MilestoneStatus;

  // Partner permissions
  if (userRole === "partner") {
    return {
      // Partner can edit milestones that are in early stages or not yet in active work
      // Allow editing for: PROPOSED, DRAFT, ACCEPTED, FINALIZED, FUNDED
      // Don't allow editing once work has started (IN_PROGRESS and beyond)
      canEdit: isProjectOwner && (
        status === "PROPOSED" || 
        status === "DRAFT" ||
        status === "ACCEPTED" ||
        status === "FINALIZED" ||
        status === "FUNDED" ||
        // Also allow editing if status is not yet in progress or beyond
        !["IN_PROGRESS", "SUBMITTED", "SUPERVISOR_REVIEW", "PARTNER_REVIEW", "APPROVED", "RELEASED", "COMPLETED", "CHANGES_REQUESTED"].includes(status)
      ),
      // Partner can always add milestones to their own projects
      canAdd: isProjectOwner,
      // Partner can approve and release if milestone is in PARTNER_REVIEW and supervisor has approved
      canApproveAndRelease:
        isProjectOwner &&
        status === "PARTNER_REVIEW" &&
        milestone.supervisorGate === true,
      // Partner can disapprove if milestone is RELEASED (revert approval)
      canDisapprove: isProjectOwner && status === "RELEASED",
      // Partner can request changes if milestone is in PARTNER_REVIEW
      canRequestChanges: isProjectOwner && status === "PARTNER_REVIEW",
      // Partner can fund escrow if milestone is FINALIZED
      canFundEscrow: isProjectOwner && status === "FINALIZED",
      // Partners don't submit work
      canSubmit: false,
      // Partners can dispute in certain statuses
      canDispute:
        isProjectOwner &&
        (status === "IN_PROGRESS" ||
          status === "SUBMITTED" ||
          status === "SUPERVISOR_REVIEW" ||
          status === "PARTNER_REVIEW" ||
          status === "CHANGES_REQUESTED"),
      // Partner can mark as complete if milestone is RELEASED
      canMarkAsComplete: isProjectOwner && status === "RELEASED",
      // Partner can unmark as complete if milestone is COMPLETED (undo action)
      canUnmarkAsComplete: isProjectOwner && status === "COMPLETED",
    };
  }

  // Student permissions
  if (userRole === "student") {
    return {
      // Students cannot edit milestone details
      canEdit: false,
      // Students cannot add milestones
      canAdd: false,
      // Students cannot approve/release
      canApproveAndRelease: false,
      // Students cannot request changes
      canRequestChanges: false,
      // Students cannot fund escrow
      canFundEscrow: false,
      // Students can submit work if milestone is in IN_PROGRESS or FINALIZED
      canSubmit:
        status === "IN_PROGRESS" ||
        status === "FINALIZED" ||
        status === "CHANGES_REQUESTED",
      // Students can dispute in certain statuses
      canDispute:
        status === "IN_PROGRESS" ||
        status === "SUBMITTED" ||
        status === "SUPERVISOR_REVIEW" ||
        status === "PARTNER_REVIEW" ||
        status === "CHANGES_REQUESTED",
      // Students cannot mark as complete
      canMarkAsComplete: false,
      // Students cannot unmark as complete
      canUnmarkAsComplete: false,
    };
  }

  // Supervisor permissions
  if (userRole === "supervisor") {
    return {
      // Supervisors cannot edit milestone details
      canEdit: false,
      // Supervisors cannot add milestones
      canAdd: false,
      // Supervisors cannot approve/release (only partner can)
      canApproveAndRelease: false,
      // Supervisors cannot disapprove
      canDisapprove: false,
      // Supervisors cannot request changes (only partner can)
      canRequestChanges: false,
      // Supervisors cannot fund escrow
      canFundEscrow: false,
      // Supervisors don't submit work
      canSubmit: false,
      // Supervisors can dispute in certain statuses
      canDispute:
        status === "IN_PROGRESS" ||
        status === "SUBMITTED" ||
        status === "SUPERVISOR_REVIEW" ||
        status === "PARTNER_REVIEW" ||
        status === "CHANGES_REQUESTED",
      // Supervisors cannot mark as complete
      canMarkAsComplete: false,
      // Supervisors cannot unmark as complete
      canUnmarkAsComplete: false,
    };
  }

  // University Admin permissions
  if (userRole === "university-admin") {
    return {
      // University admins cannot edit milestone details
      canEdit: false,
      // University admins cannot add milestones
      canAdd: false,
      // University admins cannot approve/release
      canApproveAndRelease: false,
      // University admins cannot disapprove
      canDisapprove: false,
      // University admins cannot request changes
      canRequestChanges: false,
      // University admins cannot fund escrow
      canFundEscrow: false,
      // University admins don't submit work
      canSubmit: false,
      // University admins can dispute in certain statuses
      canDispute:
        status === "IN_PROGRESS" ||
        status === "SUBMITTED" ||
        status === "SUPERVISOR_REVIEW" ||
        status === "PARTNER_REVIEW" ||
        status === "CHANGES_REQUESTED",
      // University admins cannot mark as complete
      canMarkAsComplete: false,
      // University admins cannot unmark as complete
      canUnmarkAsComplete: false,
    };
  }

  // Super Admin permissions
  if (userRole === "super-admin") {
    return {
      // Super admins can edit milestones (full access)
      canEdit: true,
      // Super admins can add milestones
      canAdd: true,
      // Super admins can approve/release (full access)
      canApproveAndRelease: status === "PARTNER_REVIEW",
      // Super admins can disapprove if milestone is RELEASED
      canDisapprove: status === "RELEASED",
      // Super admins can request changes
      canRequestChanges: status === "PARTNER_REVIEW",
      // Super admins can fund escrow
      canFundEscrow: status === "FINALIZED",
      // Super admins don't submit work
      canSubmit: false,
      // Super admins can dispute
      canDispute: true,
      // Super admins can mark as complete (full access)
      canMarkAsComplete: status === "RELEASED",
      // Super admins can unmark as complete (full access)
      canUnmarkAsComplete: status === "COMPLETED",
    };
  }

  // Default: no permissions
  return {
    canEdit: false,
    canAdd: false,
    canApproveAndRelease: false,
    canDisapprove: false,
    canRequestChanges: false,
    canFundEscrow: false,
    canSubmit: false,
    canDispute: false,
    canMarkAsComplete: false,
    canUnmarkAsComplete: false,
  };
}


