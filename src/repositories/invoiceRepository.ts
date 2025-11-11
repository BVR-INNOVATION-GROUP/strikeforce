/**
 * Repository for invoice data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { InvoiceI } from "@/src/models/invoice";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const invoiceRepository = {
  /**
   * Get all invoices for a partner
   */
  getByPartnerId: async (partnerId: number | string): Promise<InvoiceI[]> => {
    if (getUseMockData()) {
      const invoices = await readJsonFile<InvoiceI>("mockInvoices.json");
      const numericPartnerId =
        typeof partnerId === "string" ? parseInt(partnerId, 10) : partnerId;
      return invoices.filter((inv) => inv.partnerId === numericPartnerId);
    }
    return api.get<InvoiceI[]>(`/api/invoices?partnerId=${partnerId}`);
  },

  /**
   * Get invoice by ID
   */
  getById: async (id: number): Promise<InvoiceI> => {
    if (getUseMockData()) {
      const invoices = await readJsonFile<InvoiceI>("mockInvoices.json");
      const invoice = findById(invoices, id);
      if (!invoice) {
        throw new Error(`Invoice ${id} not found`);
      }
      return invoice;
    }
    return api.get<InvoiceI>(`/api/invoices/${id}`);
  },

  /**
   * Download invoice PDF
   */
  downloadInvoice: async (id: number): Promise<Blob> => {
    if (getUseMockData()) {
      // In production, return actual PDF blob
      throw new Error("PDF download not available in mock mode");
    }
    return api.get<Blob>(`/api/invoices/${id}/download`, {
      headers: { Accept: "application/pdf" },
    });
  },
};
