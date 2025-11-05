/**
 * Service layer for invoice business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import { invoiceRepository } from "@/src/repositories/invoiceRepository";
import { InvoiceI } from "@/src/models/invoice";

export interface InvoiceFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Invoice statistics interface
 */
export interface InvoiceStatistics {
  total: number;
  paid: number;
  pending: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export const invoiceService = {
  /**
   * Get all invoices for a partner with optional filtering
   */
  getPartnerInvoices: async (
    partnerId: string,
    filters?: InvoiceFilters
  ): Promise<InvoiceI[]> => {
    const invoices = await invoiceRepository.getByPartnerId(partnerId);

    // Apply business logic filters
    let filtered = invoices;

    if (filters?.status) {
      filtered = filtered.filter((inv) => inv.status === filters.status);
    }

    if (filters?.dateFrom) {
      filtered = filtered.filter(
        (inv) => new Date(inv.createdAt) >= new Date(filters.dateFrom!)
      );
    }

    if (filters?.dateTo) {
      filtered = filtered.filter(
        (inv) => new Date(inv.createdAt) <= new Date(filters.dateTo!)
      );
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Get invoice statistics for a partner
   * @param partnerId - Partner ID
   * @returns Invoice statistics
   */
  getInvoiceStatistics: async (partnerId: string): Promise<InvoiceStatistics> => {
    const invoices = await invoiceRepository.getByPartnerId(partnerId);

    return {
      total: invoices.length,
      paid: invoices.filter((inv) => inv.status === "PAID").length,
      pending: invoices.filter((inv) => inv.status === "SENT").length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
      paidAmount: invoices
        .filter((inv) => inv.status === "PAID")
        .reduce((sum, inv) => sum + inv.total, 0),
      pendingAmount: invoices
        .filter((inv) => inv.status === "SENT")
        .reduce((sum, inv) => sum + inv.total, 0),
    };
  },
};

