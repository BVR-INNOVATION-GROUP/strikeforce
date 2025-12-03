/**
 * Repository for submission data operations
 * Connects to backend API
 * Note: Backend Submission module may need to be implemented
 */
import { api } from "@/src/api/client";
import { SubmissionI } from "@/src/models/submission";

export const submissionRepository = {
  /**
   * Get all submissions
   * @param milestoneId - Optional filter by milestone
   */
  getAll: async (milestoneId?: number): Promise<SubmissionI[]> => {
    const url = milestoneId
      ? `/api/v1/submissions?milestoneId=${milestoneId}`
      : "/api/v1/submissions";
    return api.get<SubmissionI[]>(url);
  },

  /**
   * Get submission by ID
   */
  getById: async (id: number): Promise<SubmissionI> => {
    return api.get<SubmissionI>(`/api/v1/submissions/${id}`);
  },

  /**
   * Create submission
   */
  create: async (submission: Partial<SubmissionI>): Promise<SubmissionI> => {
    return api.post<SubmissionI>("/api/v1/submissions", submission);
  },

  /**
   * Update submission
   */
  update: async (
    id: number,
    submission: Partial<SubmissionI>
  ): Promise<SubmissionI> => {
    return api.put<SubmissionI>(`/api/v1/submissions/${id}`, submission);
  },

  /**
   * Delete submission
   */
  delete: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/submissions/${id}`);
  },
};

