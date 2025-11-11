/**
 * Supervisor model - represents supervisor capacity and requests
 */
export type SupervisorRequestStatus = "PENDING" | "APPROVED" | "DENIED";

export interface SupervisorCapacityI {
  supervisorId: number; // User ID (numeric)
  maxActive: number;
  currentActive: number;
}

export interface SupervisorRequestI {
  id: number;
  projectId: number;
  studentOrGroupId: number; // User ID or Group ID (numeric)
  supervisorId: number; // User ID (numeric)
  status: SupervisorRequestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}





