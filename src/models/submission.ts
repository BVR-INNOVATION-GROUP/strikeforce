/**
 * Submission model - represents milestone submissions
 */
export interface SubmissionI {
  id: string;
  milestoneId: string;
  byGroupId?: string;
  byStudentId?: string;
  files: string[];
  notes: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}





