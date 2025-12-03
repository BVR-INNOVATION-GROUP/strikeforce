/**
 * Repository for portfolio data operations
 * Connects to backend API
 */
import { api } from "@/src/api/client";
import { PortfolioItemI } from "@/src/models/portfolio";

export const portfolioRepository = {
  /**
   * Get all portfolio items for the authenticated user
   * Backend uses JWT token's user_id - never pass userId parameter
   */
  getAll: async (): Promise<PortfolioItemI[]> => {
    return api.get<PortfolioItemI[]>("/api/v1/portfolio");
  },

  /**
   * Get portfolio item by ID
   */
  getById: async (id: number): Promise<PortfolioItemI> => {
    return api.get<PortfolioItemI>(`/api/v1/portfolio/${id}`);
  },

  /**
   * Create portfolio item
   */
  create: async (item: Partial<PortfolioItemI>): Promise<PortfolioItemI> => {
    return api.post<PortfolioItemI>("/api/v1/portfolio", item);
  },

  /**
   * Update portfolio item
   */
  update: async (id: number, item: Partial<PortfolioItemI>): Promise<PortfolioItemI> => {
    return api.put<PortfolioItemI>(`/api/v1/portfolio/${id}`, item);
  },

  /**
   * Delete portfolio item
   */
  delete: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/portfolio/${id}`);
  },
};

