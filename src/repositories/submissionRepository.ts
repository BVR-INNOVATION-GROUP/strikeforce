/**
 * Repository for submission data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { SubmissionI } from "@/src/models/submission";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const submissionRepository = {
  /**
   * Get all submissions
   * @param milestoneId - Optional filter by milestone
   */
  getAll: async (milestoneId?: number): Promise<SubmissionI[]> => {
    if (getUseMockData()) {
      try {
        let submissions = await readJsonFile<SubmissionI>("mockSubmissions.json");
        if (milestoneId) {
          submissions = submissions.filter(
            (s) => s.milestoneId === milestoneId
          );
        }
        return submissions;
      } catch {
        // Mock file doesn't exist yet, return empty array
        return [];
      }
    }
    const url = milestoneId
      ? `/api/submissions?milestoneId=${milestoneId}`
      : "/api/submissions";
    return api.get<SubmissionI[]>(url);
  },

  /**
   * Get submission by ID
   */
  getById: async (id: number): Promise<SubmissionI> => {
    if (getUseMockData()) {
      try {
        const submissions = await readJsonFile<SubmissionI>("mockSubmissions.json");
        const submission = findById(submissions, id);
        if (!submission) {
          throw new Error(`Submission ${id} not found`);
        }
        return submission;
      } catch {
        throw new Error(`Submission ${id} not found`);
      }
    }
    return api.get<SubmissionI>(`/api/submissions/${id}`);
  },

  /**
   * Create submission
   */
  create: async (submission: Partial<SubmissionI>): Promise<SubmissionI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<SubmissionI>("/api/submissions", submission);
  },

  /**
   * Update submission
   */
  update: async (
    id: number,
    submission: Partial<SubmissionI>
  ): Promise<SubmissionI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<SubmissionI>(`/api/submissions/${id}`, submission);
  },

  /**
   * Delete submission
   */
  delete: async (id: number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/submissions/${id}`);
  },
};

