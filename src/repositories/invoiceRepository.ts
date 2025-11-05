/**
 * Repository for invoice data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { InvoiceI } from "@/src/models/invoice";

// Environment configuration
// Default to mock data in development mode
// Can be disabled by setting NEXT_PUBLIC_USE_MOCK=false
const isDevelopment = process.env.NODE_ENV === "development";
const USE_MOCK_DATA =
  isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const invoiceRepository = {
  /**
   * Get all invoices for a partner
   */
  getByPartnerId: async (partnerId: string): Promise<InvoiceI[]> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockInvoices.json");
      const invoices = mockData.default as InvoiceI[];
      return invoices.filter((inv) => inv.partnerId === partnerId);
    }
    return api.get<InvoiceI[]>(`/api/invoices?partnerId=${partnerId}`);
  },

  /**
   * Get invoice by ID
   */
  getById: async (id: string): Promise<InvoiceI> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockInvoices.json");
      const invoices = mockData.default as InvoiceI[];
      const invoice = invoices.find((inv) => inv.id === id);
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
  downloadInvoice: async (id: string): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      // In production, return actual PDF blob
      throw new Error("PDF download not available in mock mode");
    }
    return api.get<Blob>(`/api/invoices/${id}/download`, {
      headers: { Accept: "application/pdf" },
    });
  },
};
