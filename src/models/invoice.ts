/**
 * Invoice model - represents invoices and receipts
 */
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "CANCELLED";

export interface InvoiceI {
  id: number;
  contractId?: number;
  partnerId: number;
  lineItems: InvoiceLineItemI[];
  subtotal: number;
  tax?: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
}

export interface InvoiceLineItemI {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}





