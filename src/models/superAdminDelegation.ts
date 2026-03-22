/**
 * Super-admin → super-admin delegation (platform scope; not tied to an organization).
 */
export interface SuperAdminDelegationI {
  id: number;
  delegatedUserId: number;
  delegatedUser: {
    id: number;
    email: string;
    name: string;
    role?: string;
  };
  delegatorId: number;
  delegator: {
    id: number;
    email: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSuperAdminDelegationRequest {
  email: string;
  name: string;
}
