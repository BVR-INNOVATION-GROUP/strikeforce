"use client";

import React, { useEffect, useState } from "react";
import Card from "@/src/components/core/Card";
import { PortfolioItemI } from "@/src/models/portfolio";
import { ReputationScoreI } from "@/src/models/portfolio";
import { useAuthStore } from "@/src/store";
import { portfolioService } from "@/src/services/portfolioService";
import { reputationService } from "@/src/services/reputationService";
import { Award, ExternalLink, Star } from "lucide-react";
import ReputationCard from "@/src/components/screen/student/ReputationCard";
import DashboardLoading from "@/src/components/core/DashboardLoading";

/**
 * Student Portfolio - view verified portfolio items and reputation
 */
export default function StudentPortfolio() {
  const { user } = useAuthStore();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemI[]>([]);
  const [reputation, setReputation] = useState<ReputationScoreI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.id) return;

        // Load portfolio items (backend uses JWT token to get authenticated user's portfolio)
        const userPortfolio = await portfolioService.getUserPortfolio();
        setPortfolioItems(userPortfolio);

        // Calculate reputation score
        const reputationScore = await reputationService.calculateReputation(user.id.toString(), userPortfolio);
        setReputation(reputationScore);
      } catch (error) {
        console.error("Failed to load portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Portfolio</h1>
        <p className="text-secondary">Your verified work and achievements</p>
      </div>

      {/* Reputation Score */}
      {reputation && <ReputationCard reputation={reputation} />}

      {/* Portfolio Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolioItems.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{item.role}</h3>
                <p className="text-sm text-secondary">Complexity: {item.complexity}</p>
              </div>
              {item.rating && (
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{item.rating}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-default mb-4">{item.scope}</p>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-secondary">Amount Delivered</p>
                <p className="font-semibold">${item.amountDelivered.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Verified</p>
                <p className="font-semibold text-sm">
                  {new Date(item.verifiedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {item.proof.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.proof.map((proof, idx) => (
                  <a
                    key={idx}
                    href={proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink size={14} />
                    Proof {idx + 1}
                  </a>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {portfolioItems.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Award size={48} className="mx-auto mb-4 text-muted-light" />
            <p className="text-muted mb-2">No portfolio items yet</p>
            <p className="text-sm text-muted-light">
              Complete projects and milestones to build your portfolio
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

