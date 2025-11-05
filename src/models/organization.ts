/**
 * Organization model - represents universities and partner organizations
 */
export type OrganizationType = "PARTNER" | "UNIVERSITY";

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

export interface OrganizationI {
  id: string;
  type: OrganizationType;
  name: string;
  email: string;
  kycStatus: KycStatus;
  billingProfile?: BillingProfileI;
  createdAt: string;
  updatedAt: string;
}

export interface BillingProfileI {
  orgId: string;
  taxId?: string;
  address?: string;
  country?: string;
  paymentMethods: PaymentMethodI[];
}

export interface PaymentMethodI {
  id: string;
  type: "BANK_TRANSFER" | "CARD" | "MOBILE_MONEY";
  details: Record<string, string>;
  isDefault: boolean;
}





