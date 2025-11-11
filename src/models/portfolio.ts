/**
 * Portfolio model - represents verified portfolio items from completed work
 * PRD Reference: Section 11 - Performance and Reputation
 */
export interface PortfolioItemI {
  id: number;
  userId: number; // User ID (numeric)
  projectId: number;
  milestoneId?: number;
  role: string; // Student's role in the project
  scope: string; // Description of work done
  proof: string[]; // Links to proof files/repos
  rating?: number; // Partner rating (1-5)
  complexity: "LOW" | "MEDIUM" | "HIGH";
  amountDelivered: number; // Amount earned
  currency: string;
  onTime: boolean; // Was delivered on time
  verifiedAt: string; // Auto-created timestamp
  createdAt: string;
  updatedAt: string;
}

/**
 * Reputation score calculation inputs
 */
export interface ReputationFactorsI {
  completedProjects: number;
  averageRating: number;
  onTimeRate: number; // 0-1
  disputeRate: number; // 0-1
  reworkRate: number; // 0-1
  complexityBonus: number; // Weighted by project complexity
}

/**
 * Reputation score (0-100)
 */
export interface ReputationScoreI {
  userId: number; // User ID (numeric)
  score: number;
  factors: ReputationFactorsI;
  lastCalculatedAt: string;
}
