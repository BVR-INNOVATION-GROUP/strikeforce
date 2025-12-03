/**
 * Invitation model - represents invitation links for students and supervisors
 */
export type InvitationRole = "student" | "supervisor";
export type InvitationStatus = "PENDING" | "USED" | "EXPIRED";

export interface InvitationI {
  id: number;
  email: string;
  name?: string;
  role: InvitationRole;
  orgId?: number;
  organizationId?: number;
  universityId?: number;
  departmentId?: number;
  token: string;
  expiresAt: string;
  usedAt?: string;
  status: InvitationStatus;
  createdAt: string;
}
