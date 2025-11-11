/**
 * Invitation model - represents invitation links for students and supervisors
 */
export type InvitationRole = "student" | "supervisor";
export type InvitationStatus = "PENDING" | "USED" | "EXPIRED";

export interface InvitationI {
  id: number;
  email: string;
  role: InvitationRole;
  orgId?: number;
  universityId?: number;
  token: string;
  expiresAt: string;
  usedAt?: string;
  status: InvitationStatus;
  createdAt: string;
}





