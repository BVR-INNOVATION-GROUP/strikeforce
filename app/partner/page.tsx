"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import StatCard from "@/src/components/core/StatCard";
import LineChart from "@/src/components/base/LineChart";
import BarChart from "@/src/components/base/BarChart";
import { projectService } from "@/src/services/projectService";
import { dashboardService, DashboardStats } from "@/src/services/dashboardService";
import { ProjectI } from "@/src/models/project";
import { useAuthStore } from "@/src/store";
import { Briefcase, DollarSign, Users, TrendingUp } from "lucide-react";

/**
 * Partner Dashboard - overview of projects, wallet, and activity
 */
export default function PartnerDashboard() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, dashboardStats] = await Promise.all([
          projectService.getAllProjects(),
          dashboardService.getPartnerDashboardStats(user?.id?.toString() || "", user?.orgId?.toString()),
        ]);
        setProjects(projectsData);
        setStats(dashboardStats);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  // Chart data - projects over time
  const projectTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthProjects = projects.filter((p) => {
        const created = new Date(p.createdAt).getMonth();
        return created <= index;
      });
      return {
        name: month,
        "Total Projects": monthProjects.length,
        "Active Projects": monthProjects.filter((p) => p.status === "in-progress").length,
      };
    });
  }, [projects]);

  // Chart data - budget by status
  const budgetByStatusData = useMemo(() => {
    const statusMap = projects.reduce((acc, project) => {
      const status = project.status === "in-progress" ? "In Progress" :
        project.status === "completed" ? "Completed" :
          project.status === "on-hold" ? "On Hold" : "Draft";
      acc[status] = (acc[status] || 0) + project.budget;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusMap).map(([name, budget]) => ({
      name,
      "Budget": budget,
    }));
  }, [projects]);

  if (loading || !stats) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Dashboard</h1>
        <p className="text-[0.875rem] opacity-60">Overview of projects, wallet, and activity</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Briefcase size={20} />}
            title="Total Projects"
            value={stats.totalProjects}
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            title="Active Projects"
            value={stats.activeProjects}
            change={stats.activeProjectsChange}
          />
          <StatCard
            icon={<DollarSign size={20} />}
            title="Total Budget"
            value={`$${stats.totalBudget.toLocaleString()}`}
            change={stats.totalBudgetChange}
          />
          <StatCard
            icon={<Users size={20} />}
            title="Completed"
            value={stats.completedProjects}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LineChart
          title="Projects Over Time"
          data={projectTrendData}
          lines={[
            { key: "Total Projects", label: "Total Projects" },
            { key: "Active Projects", label: "Active Projects" },
          ]}
        />
        <BarChart
          title="Budget by Status"
          data={budgetByStatusData}
          bars={[
            { key: "Budget", label: "Budget" },
          ]}
        />
      </div>

      {/* Recent Projects */}
      <Card title="Recent Projects" className="flex-1 min-h-0">
        <div className="space-y-3">
          {projects.slice(0, 5).map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-8 bg-pale rounded-lg hover:opacity-100 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex-1">
                <h3 className="text-[1rem] font-[600] hover:text-primary transition-colors mb-2">{project.title}</h3>
                <p className="text-[0.875rem] opacity-60 line-clamp-2">{project.description.substring(0, 60)}...</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusIndicator status={project.status} />
                <span className="text-[0.875rem] font-[500]">
                  ${project.budget.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-center opacity-60 py-8">No projects yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
