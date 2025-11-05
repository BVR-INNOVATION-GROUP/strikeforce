/**
 * User model - represents all user types in the system
 */
export type UserRole = "partner" | "student" | "supervisor" | "university-admin" | "super-admin";

export interface UserI {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  orgId?: string;
  universityId?: string;
  departmentId?: string;
  courseId?: string;
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
  id: string;
  type: "BANK_ACCOUNT" | "MOBILE_MONEY" | "DIGITAL_WALLET";
  details: Record<string, string>;
  isVerified: boolean;
}





