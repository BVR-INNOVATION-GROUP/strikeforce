/**
 * Screening Stats Cards Component - uses StatCard component for consistent theming
 */
"use client";

import React from "react";
import StatCard from "@/src/components/core/StatCard";
import { TrendingUp, Users, Star } from "lucide-react";
import { ApplicationI } from "@/src/models/application";

export interface Props {
  applications: ApplicationI[];
  shortlistedCount: number;
}

/**
 * Display statistics for screening page using StatCard components
 */
const ScreeningStatsCards = ({ applications, shortlistedCount }: Props) => {
  const scoredApplications = applications.filter((a) => a.score);
  const avgScore =
    scoredApplications.length > 0
      ? Math.round(
          scoredApplications.reduce(
            (sum, a) => sum + (a.score?.finalScore || 0),
            0
          ) / scoredApplications.length
        )
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={<TrendingUp size={20} />}
        title="Avg Score"
        value={avgScore}
      />
      <StatCard
        icon={<Users size={20} />}
        title="Shortlisted"
        value={shortlistedCount}
      />
      <StatCard
        icon={<Star size={20} />}
        title="Scored"
        value={scoredApplications.length}
      />
    </div>
  );
};

export default ScreeningStatsCards;


