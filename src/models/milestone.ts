/**
 * Milestone model - represents project milestones negotiated in chat
 */
export type MilestoneStatus = 
  | "DRAFT" 
  | "PROPOSED" 
  | "ACCEPTED" 
  | "FINALIZED" 
  | "FUNDED" 
  | "IN_PROGRESS" 
  | "SUBMITTED" 
  | "SUPERVISOR_REVIEW" 
  | "PARTNER_REVIEW" 
  | "APPROVED" 
  | "CHANGES_REQUESTED" 
  | "RELEASED" 
  | "COMPLETED";

export interface MilestoneProposalI {
  id: number;
  projectId: number;
  proposerId: number; // User ID (numeric)
  title: string;
  scope: string;
  acceptanceCriteria: string;
  dueDate: string;
  amount?: number;
  status: MilestoneStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneI {
  id: number;
  projectId: number;
  title: string;
  scope: string;
  acceptanceCriteria: string;
  dueDate: string;
  amount: number;
  currency?: string; // Optional currency code, defaults to project currency if not provided
  escrowStatus: EscrowStatus;
  supervisorGate: boolean; // Has supervisor approved
  status: MilestoneStatus;
  createdAt: string;
  updatedAt: string;
}

export type EscrowStatus = "PENDING" | "FUNDED" | "HELD" | "RELEASED";

export interface EscrowI {
  id: number;
  milestoneId: number;
  amountHeld: number;
  fundedAt?: string;
  releasedAt?: string;
  status: EscrowStatus;
}


