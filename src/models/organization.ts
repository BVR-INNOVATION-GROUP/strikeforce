/**
 * Organization model - represents universities and partner organizations
 */
export type OrganizationType = "PARTNER" | "UNIVERSITY";

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

export interface OrganizationI {
  id: number;
  userId?: number;
  type: OrganizationType;
  name: string;
  email: string;
  kycStatus: KycStatus;
  logo?: string;
  website?: string;
  brandColor?: string;
  address?: string;
  billingProfile?: BillingProfileI;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentStatI {
  departmentId: number;
  departmentName: string;
  activeProjects: number;
  completedProjects: number;
  pendingProjects: number;
}

export interface RecentProjectStatI {
  id: number;
  title: string;
  status: string;
  departmentName: string;
}

export interface OrganizationDashboardStats {
  totalStudents: number;
  activeProjects: number;
  pendingReviews: number;
  departmentStats: DepartmentStatI[];
  recentProjects: RecentProjectStatI[];
  studentTrend?: {
    month: string;
    count: number;
  }[];
}

export interface BillingProfileI {
  orgId: number;
  taxId?: string;
  address?: string;
  country?: string;
  contactName?: string;
  phone?: string;
  website?: string;
  paymentMethods?: PaymentMethodI[];
}

export interface PaymentMethodI {
  id: number;
  type: "BANK_TRANSFER" | "CARD" | "MOBILE_MONEY";
  details: Record<string, string>;
  isDefault: boolean;
}





