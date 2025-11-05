"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import { dashboardService, DashboardStats } from "@/src/services/dashboardService";
import { useAuthStore } from "@/src/store";
import { Search, Briefcase, Award, DollarSign, TrendingUp } from "lucide-react";

/**
 * Student Dashboard - overview with stats and quick access to Find Projects
 */
export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const dashboardStats = await dashboardService.getStudentDashboardStats(user.id);
          setStats(dashboardStats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  if (loading || !stats) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Dashboard</h1>
        <p className="text-[0.875rem] opacity-60">Welcome back, {user?.name || "Student"}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Briefcase size={20} />}
          title="Active Projects"
          value={stats.activeProjects}
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
          value={`$${stats.totalBudget.toLocaleString()}`}
          change={stats.totalBudgetChange}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Total Projects"
          value={stats.totalProjects}
        />
      </div>

      {/* Find Projects Section */}
      <Card className="mb-8">
        <Link href="/student/projects" className="flex items-center gap-4 p-6 hover:bg-pale transition-colors rounded-lg">
          <div className="p-4 rounded-lg bg-pale-primary">
            <Search size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Find</h3>
            <p className="text-sm opacity-60">Discover and apply to new projects</p>
          </div>
        </Link>
      </Card>
    </div>
  );
}
