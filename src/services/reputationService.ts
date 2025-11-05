/**
 * Reputation Service - business logic for reputation scoring
 * PRD Reference: Section 11 - Performance and Reputation
 */
import { ReputationScoreI, ReputationFactorsI } from '@/src/models/portfolio';
import { PortfolioItemI } from '@/src/models/portfolio';

/**
 * Business logic layer for reputation operations
 */
export const reputationService = {
  /**
   * Calculate reputation score for a user
   * PRD: Weighted across completed projects, avg ratings, on-time rate, dispute rate, rework, complexity
   * @param userId - User ID
   * @param portfolioItems - User's portfolio items (optional, will fetch if not provided)
   * @returns Reputation score (0-100)
   */
  calculateReputation: async (
    userId: string,
    portfolioItems?: PortfolioItemI[]
  ): Promise<ReputationScoreI> => {
    // Fetch portfolio if not provided
    if (!portfolioItems) {
      const { portfolioService } = await import('@/src/services/portfolioService');
      portfolioItems = await portfolioService.getUserPortfolio(userId);
    }

    // Calculate factors
    const factors = reputationService.calculateFactors(portfolioItems);

    // Calculate weighted score (0-100)
    const score = reputationService.calculateScore(factors);

    return {
      userId,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      factors,
      lastCalculatedAt: new Date().toISOString(),
    };
  },

  /**
   * Calculate reputation factors from portfolio items
   * @param portfolioItems - Array of portfolio items
   * @returns Calculated factors
   */
  calculateFactors: (portfolioItems: PortfolioItemI[]): ReputationFactorsI => {
    if (portfolioItems.length === 0) {
      return {
        completedProjects: 0,
        averageRating: 0,
        onTimeRate: 0,
        disputeRate: 0,
        reworkRate: 0,
        complexityBonus: 0,
      };
    }

    // Count completed projects (unique project IDs)
    const uniqueProjects = new Set(portfolioItems.map((item) => item.projectId));
    const completedProjects = uniqueProjects.size;

    // Average rating (weighted by amount if multiple ratings)
    let totalRating = 0;
    let totalWeight = 0;
    portfolioItems.forEach((item) => {
      if (item.rating) {
        const weight = item.amountDelivered;
        totalRating += item.rating * weight;
        totalWeight += weight;
      }
    });
    const averageRating = totalWeight > 0 ? totalRating / totalWeight : 0;

    // On-time rate
    const onTimeCount = portfolioItems.filter((item) => item.onTime).length;
    const onTimeRate = portfolioItems.length > 0 ? onTimeCount / portfolioItems.length : 0;

    // Dispute rate (would need dispute data - for now assume 0)
    const disputeRate = 0;

    // Rework rate (would need milestone resubmission data - for now assume 0)
    const reworkRate = 0;

    // Complexity bonus (weighted average of complexity scores)
    let complexityScore = 0;
    portfolioItems.forEach((item) => {
      if (item.complexity === "LOW") complexityScore += 1;
      else if (item.complexity === "MEDIUM") complexityScore += 2;
      else if (item.complexity === "HIGH") complexityScore += 3;
    });
    const complexityBonus = portfolioItems.length > 0 ? complexityScore / portfolioItems.length : 0;

    return {
      completedProjects,
      averageRating,
      onTimeRate,
      disputeRate,
      reworkRate,
      complexityBonus,
    };
  },

  /**
   * Calculate weighted reputation score from factors
   * PRD weights:
   * - Completed projects: 20%
   * - Average rating: 30%
   * - On-time rate: 25%
   * - Dispute rate: -15% (negative impact)
   * - Rework rate: -10% (negative impact)
   * - Complexity bonus: 10%
   * @param factors - Reputation factors
   * @returns Score from 0-1 (multiply by 100 for percentage)
   */
  calculateScore: (factors: ReputationFactorsI): number => {
    // Normalize completed projects (0-10 projects = 0-1 score, capped at 10)
    const projectScore = Math.min(factors.completedProjects / 10, 1);

    // Normalize average rating (1-5 = 0-1 score)
    const ratingScore = (factors.averageRating - 1) / 4;

    // On-time rate is already 0-1

    // Dispute rate (negative, already 0-1)
    const disputePenalty = factors.disputeRate * 0.15;

    // Rework rate (negative, already 0-1)
    const reworkPenalty = factors.reworkRate * 0.1;

    // Complexity bonus (normalize: 1-3 = 0-1 score)
    const complexityScore = (factors.complexityBonus - 1) / 2;

    // Weighted calculation
    const score =
      projectScore * 0.2 +
      ratingScore * 0.3 +
      factors.onTimeRate * 0.25 +
      complexityScore * 0.1 -
      disputePenalty -
      reworkPenalty;

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  },

  /**
   * Get reputation score for a user (cached or calculated)
   * @param userId - User ID
   * @returns Reputation score
   */
  getReputation: async (userId: string): Promise<ReputationScoreI> => {
    // In production, check cache first, then calculate if needed
    return reputationService.calculateReputation(userId);
  },
};





