/**
 * Reputation Card Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import { TrendingUp } from "lucide-react";
import { ReputationScoreI } from "@/src/models/portfolio";

export interface Props {
  reputation: ReputationScoreI;
}

/**
 * Display reputation score and factors
 */
const ReputationCard = ({ reputation }: Props) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-secondary mb-1">Reputation Score</p>
          <p className="text-3xl font-bold text-primary">
            {(reputation.score * 100).toFixed(1)}/100
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={24} className="text-success" />
          <div className="text-right">
            <p className="text-xs text-secondary">Based on</p>
            <p className="text-sm font-medium">
              {reputation.factors.completedProjects} completed projects
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-custom">
        <div>
          <p className="text-xs text-secondary">Avg Rating</p>
          <p className="text-sm font-semibold">
            {reputation.factors.averageRating > 0
              ? reputation.factors.averageRating.toFixed(1)
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">On-Time Rate</p>
          <p className="text-sm font-semibold">
            {(reputation.factors.onTimeRate * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">Dispute Rate</p>
          <p className="text-sm font-semibold">
            {(reputation.factors.disputeRate * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">Rework Rate</p>
          <p className="text-sm font-semibold">
            {(reputation.factors.reworkRate * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary">Complexity</p>
          <p className="text-sm font-semibold">
            {reputation.factors.complexityBonus.toFixed(1)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ReputationCard;

