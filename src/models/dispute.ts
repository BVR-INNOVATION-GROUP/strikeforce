/**
 * Dispute model - represents disputes and escalation
 */
export type DisputeSubjectType = "MILESTONE" | "PAYOUT" | "APPLICATION" | "SUPERVISOR";
export type DisputeStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "ESCALATED";
export type DisputeLevel = "STUDENT_PARTNER" | "SUPERVISOR" | "UNIVERSITY_ADMIN" | "SUPER_ADMIN";

export interface DisputeI {
  id: number;
  subjectType: DisputeSubjectType;
  subjectId: number; // ID of milestone, payout, etc. (numeric)
  reason: string;
  description: string;
  evidence: string[]; // URLs or file paths
  status: DisputeStatus;
  level: DisputeLevel;
  raisedBy: number; // User ID (numeric)
  assignedTo?: number; // User ID (numeric)
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}





