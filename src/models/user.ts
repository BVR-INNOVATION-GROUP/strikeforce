/**
 * User model - represents all user types in the system
 */
export type UserRole =
  | "partner"
  | "student"
  | "supervisor"
  | "university-admin"
  | "delegated-admin"
  | "super-admin";

export interface UserI {
  id: number;
  role: UserRole;
  email: string;
  name: string;
  password?: string; // Password stored in mock data only (in production, passwords are hashed and stored separately)
  orgId?: number;
  universityId?: number;
  departmentId?: number;
  courseId?: number;
  profile: UserProfileI;
  payoutMethod?: PayoutMethodI;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileI {
  avatar?: string;
  bio?: string;
  skills?: string[];
  phone?: string;
  location?: string;
  portfolioItems?: string[]; // Portfolio item IDs
}

export interface PayoutMethodI {
  id: number;
  type: "BANK_ACCOUNT" | "MOBILE_MONEY" | "DIGITAL_WALLET";
  details: Record<string, string>;
  isVerified: boolean;
}
