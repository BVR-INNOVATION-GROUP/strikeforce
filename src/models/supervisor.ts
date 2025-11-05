/**
 * Supervisor model - represents supervisor capacity and requests
 */
export type SupervisorRequestStatus = "PENDING" | "APPROVED" | "DENIED";

export interface SupervisorCapacityI {
  supervisorId: string;
  maxActive: number;
  currentActive: number;
}

export interface SupervisorRequestI {
  id: string;
  projectId: string;
  studentOrGroupId: string;
  supervisorId: string;
  status: SupervisorRequestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}





