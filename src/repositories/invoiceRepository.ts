/**
 * Repository for invoice data operations
 * Connects to backend API
 * Note: Backend Invoice module may need to be implemented
 */
import { api } from "@/src/api/client";
import { InvoiceI } from "@/src/models/invoice";

export const invoiceRepository = {
  /**
   * Get all invoices for a partner
   */
  getByPartnerId: async (partnerId: number | string): Promise<InvoiceI[]> => {
    return api.get<InvoiceI[]>(`/api/v1/invoices?partnerId=${partnerId}`);
  },

  /**
   * Get invoice by ID
   */
  getById: async (id: number): Promise<InvoiceI> => {
    return api.get<InvoiceI>(`/api/v1/invoices/${id}`);
  },

  /**
   * Download invoice PDF
   */
  downloadInvoice: async (id: number): Promise<Blob> => {
    return api.get<Blob>(`/api/v1/invoices/${id}/download`, {
      headers: { Accept: "application/pdf" },
    });
  },
};
