/**
 * Application model - represents student/group applications to projects
 */
export type ApplicationType = "INDIVIDUAL" | "GROUP";
export type ApplicationStatus = "SUBMITTED" | "SHORTLISTED" | "WAITLIST" | "REJECTED" | "OFFERED" | "ACCEPTED" | "DECLINED" | "ASSIGNED";

export interface ApplicationI {
  id: number;
  projectId: number;
  applicantType: ApplicationType;
  studentIds: number[]; // Single student for INDIVIDUAL, multiple for GROUP (numeric IDs)
  groupId?: number;
  statement: string;
  status: ApplicationStatus;
  score?: ScoreI;
  offerExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreI {
  applicationId: number;
  autoScore: number;
  manualSupervisorScore?: number;
  manualPartnerScore?: number;
  finalScore: number;
  skillMatch: number;
  portfolioScore: number;
  ratingScore: number;
  onTimeRate: number;
  reworkRate: number;
}


