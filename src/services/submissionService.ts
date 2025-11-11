/**
 * Submission Service - business logic for milestone submissions
 * PRD Reference: Section 9 - Milestone Lifecycle
 */
import { SubmissionI } from '@/src/models/submission';
import { MilestoneI } from '@/src/models/milestone';

/**
 * Business logic layer for submission operations
 */
export const submissionService = {
  /**
   * Submit work for a milestone
   * @param submissionData - Submission data
   * @returns Created submission
   */
  submitMilestone: async (submissionData: Partial<SubmissionI>): Promise<SubmissionI> => {
    // Business validation
    if (!submissionData.milestoneId) {
      throw new Error("Milestone ID is required");
    }

    if (!submissionData.byStudentId && !submissionData.byGroupId) {
      throw new Error("Either student ID or group ID is required");
    }

    if (!submissionData.notes || submissionData.notes.trim().length < 10) {
      throw new Error("Submission notes must be at least 10 characters");
    }

    if (!submissionData.files || submissionData.files.length === 0) {
      throw new Error("At least one file is required for submission");
    }

    // Create submission
    const newSubmission: SubmissionI = {
      id: `submission-${Date.now()}`,
      milestoneId: submissionData.milestoneId,
      byStudentId: submissionData.byStudentId,
      byGroupId: submissionData.byGroupId,
      files: submissionData.files,
      notes: submissionData.notes.trim(),
      submittedAt: new Date().toISOString(),
    };

    // In production, save to repository/API and update milestone status
    // For now, return the created submission
    return newSubmission;
  },

  /**
   * Get submissions for a milestone
   * @param milestoneId - Milestone ID
   * @returns Array of submissions
   */
  getMilestoneSubmissions: async (milestoneId: string): Promise<SubmissionI[]> => {
    try {
      // In production, fetch from repository/API
      // For now, return empty array
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Check if milestone can be submitted (must be IN_PROGRESS and funded)
   * @param milestone - Milestone to check
   * @returns True if can be submitted
   */
  canSubmit: (milestone: MilestoneI): boolean => {
    return milestone.status === "IN_PROGRESS" && milestone.escrowStatus === "FUNDED";
  },
};








