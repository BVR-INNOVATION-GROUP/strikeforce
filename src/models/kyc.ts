/**
 * KYC model - represents KYC documents and approvals
 */
export type KycDocumentType = "CERTIFICATE" | "LICENSE" | "REGISTRATION" | "IDENTITY" | "TAX_DOCUMENT";
export type KycDocumentStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

export interface KycDocumentI {
  id: number;
  orgId: number;
  type: KycDocumentType;
  url: string;
  status: KycDocumentStatus;
  reviewedBy?: number; // User ID (numeric)
  reviewedAt?: string;
  notes?: string;
  expiresAt?: string;
  createdAt: string;
}





