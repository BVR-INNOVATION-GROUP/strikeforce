/**
 * KYC model - represents KYC documents and approvals
 */
export type KycDocumentType = "CERTIFICATE" | "LICENSE" | "REGISTRATION" | "IDENTITY" | "TAX_DOCUMENT";
export type KycDocumentStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

export interface KycDocumentI {
  id: string;
  orgId: string;
  type: KycDocumentType;
  url: string;
  status: KycDocumentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  expiresAt?: string;
  createdAt: string;
}





