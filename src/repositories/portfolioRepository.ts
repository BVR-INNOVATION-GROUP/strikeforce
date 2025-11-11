/**
 * Repository for portfolio data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { PortfolioItemI } from "@/src/models/portfolio";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const portfolioRepository = {
  /**
   * Get all portfolio items
   * @param userId - Optional filter by user
   */
  getAll: async (userId?: number | string): Promise<PortfolioItemI[]> => {
    if (getUseMockData()) {
      const items = await readJsonFile<PortfolioItemI>("mockPortfolio.json");
      if (userId) {
        const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        return items.filter((p) => p.userId === numericUserId);
      }
      return items;
    }
    const url = userId ? `/api/portfolio?userId=${userId}` : "/api/portfolio";
    return api.get<PortfolioItemI[]>(url);
  },

  /**
   * Get portfolio item by ID
   */
  getById: async (id: number): Promise<PortfolioItemI> => {
    if (getUseMockData()) {
      const items = await readJsonFile<PortfolioItemI>("mockPortfolio.json");
      const item = findById(items, id);
      if (!item) {
        throw new Error(`Portfolio item ${id} not found`);
      }
      return item;
    }
    return api.get<PortfolioItemI>(`/api/portfolio/${id}`);
  },

  /**
   * Create portfolio item
   */
  create: async (item: Partial<PortfolioItemI>): Promise<PortfolioItemI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<PortfolioItemI>("/api/portfolio", item);
  },

  /**
   * Update portfolio item
   */
  update: async (id: number, item: Partial<PortfolioItemI>): Promise<PortfolioItemI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<PortfolioItemI>(`/api/portfolio/${id}`, item);
  },

  /**
   * Delete portfolio item
   */
  delete: async (id: number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/portfolio/${id}`);
  },
};

