/**
 * Submission model - represents milestone submissions
 */
export interface SubmissionI {
  id: number;
  milestoneId: number;
  byGroupId?: number;
  byStudentId?: number; // User ID (numeric)
  files: string[];
  notes: string;
  submittedAt: string;
  reviewedBy?: number; // User ID (numeric)
  reviewedAt?: string;
}





