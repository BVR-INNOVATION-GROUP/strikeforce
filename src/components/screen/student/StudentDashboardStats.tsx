/**
 * Student Dashboard Statistics Cards
 */
"use client";

import React from "react";
import StatCard from "@/src/components/core/StatCard";
import { Briefcase, DollarSign, Award, TrendingUp } from "lucide-react";

export interface StudentDashboardStats {
  activeApplications: number;
  completedProjects: number;
  totalEarnings: number;
  portfolioItems: number;
  activeProjectsChange?: number;
  totalBudgetChange?: number;
}

export interface Props {
  stats: StudentDashboardStats;
}

/**
 * Display statistics cards for student dashboard
 */
const StudentDashboardStats = ({ stats }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Briefcase size={20} />}
        title="Active Projects"
        value={stats.activeApplications}
        change={stats.activeProjectsChange}
      />
      <StatCard
        icon={<Award size={20} />}
        title="Completed"
        value={stats.completedProjects}
      />
      <StatCard
        icon={<DollarSign size={20} />}
        title="Total Earnings"
        value={`$${stats.totalEarnings.toLocaleString()}`}
        change={stats.totalBudgetChange}
      />
      <StatCard
        icon={<TrendingUp size={20} />}
        title="Portfolio Items"
        value={stats.portfolioItems}
      />
    </div>
  );
};

export default StudentDashboardStats;








