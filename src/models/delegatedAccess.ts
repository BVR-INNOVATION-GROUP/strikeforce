/**
 * Delegated Access Model
 * Represents a delegated user who can access the same organization as the delegating admin
 */
export interface DelegatedAccessI {
  id: number;
  delegatedUserId: number;
  delegatedUser: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  delegatorId: number;
  delegator: {
    id: number;
    email: string;
    name: string;
  };
  organizationId: number;
  organization: {
    id: number;
    name: string;
    type: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDelegatedAccessRequest {
  email: string;
  name: string;
}



