/**
 * Portfolio Service - business logic for portfolio items
 * PRD Reference: Section 11 - Performance and Reputation
 */
import { PortfolioItemI } from '@/src/models/portfolio';
import { MilestoneI } from '@/src/models/milestone';
import { ProjectI } from '@/src/models/project';

/**
 * Business logic layer for portfolio operations
 */
export const portfolioService = {
  /**
   * Auto-create verified portfolio entry on milestone/project completion
   * PRD: Auto-create verified entries on milestone/project completion
   * @param milestone - Completed milestone
   * @param project - Associated project
   * @param studentIds - IDs of students who worked on milestone
   * @param role - Role description
   * @param rating - Partner rating (if provided)
   * @returns Created portfolio items for each student
   */
  createPortfolioEntry: async (
    milestone: MilestoneI,
    project: ProjectI,
    studentIds: string[],
    role: string,
    rating?: number
  ): Promise<PortfolioItemI[]> => {
    // Business validation
    if (!milestone || milestone.status !== "COMPLETED" && milestone.status !== "RELEASED") {
      throw new Error("Can only create portfolio entries for completed milestones");
    }

    if (!studentIds || studentIds.length === 0) {
      throw new Error("At least one student ID is required");
    }

    // Determine complexity based on amount
    let complexity: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
    if (milestone.amount < 1000) {
      complexity = "LOW";
    } else if (milestone.amount > 5000) {
      complexity = "HIGH";
    }

    // Check if delivered on time
    const dueDate = new Date(milestone.dueDate);
    const completedDate = new Date(milestone.updatedAt);
    const onTime = completedDate <= dueDate;

    // Create portfolio item for each student
    const portfolioItems: PortfolioItemI[] = studentIds.map((studentId) => ({
      id: `portfolio-${milestone.id}-${studentId}-${Date.now()}`,
      userId: studentId,
      projectId: project.id,
      milestoneId: milestone.id,
      role,
      scope: milestone.scope,
      proof: [], // In production, would link to submitted files
      rating,
      complexity,
      amountDelivered: milestone.amount / studentIds.length, // Split equally
      currency: project.currency || "USD",
      onTime,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // In production, save to repository/API
    return portfolioItems;
  },

  /**
   * Get portfolio items for a user
   * @param userId - User ID
   * @returns Array of portfolio items
   */
  getUserPortfolio: async (userId: string): Promise<PortfolioItemI[]> => {
    // Try to load from mock data first
    try {
      const mockData = await import("@/src/data/mockPortfolio.json");
      const allPortfolio = mockData.default as PortfolioItemI[];
      return allPortfolio.filter(item => item.userId === userId);
    } catch {
      // If mock file doesn't exist, return empty array
      // In production, would fetch from repository/API
      return [];
    }
  },

  /**
   * Get portfolio item by ID
   * @param itemId - Portfolio item ID
   * @returns Portfolio item
   */
  getPortfolioItem: async (itemId: string): Promise<PortfolioItemI | null> => {
    // In production, fetch from repository
    return null;
  },
};



