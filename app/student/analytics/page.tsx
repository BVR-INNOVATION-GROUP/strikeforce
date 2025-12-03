"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import LineChart from "@/src/components/base/LineChart";
import BarChart from "@/src/components/base/BarChart";
import { dashboardService, DashboardStats } from "@/src/services/dashboardService";
import { projectService } from "@/src/services/projectService";
import { applicationService } from "@/src/services/applicationService";
import { ProjectI } from "@/src/models/project";
import { ApplicationI } from "@/src/models/application";
import { useAuthStore } from "@/src/store";
import { Briefcase, DollarSign, Award, FileText } from "lucide-react";

/**
 * Student Analytics - detailed graphs and statistics for performance tracking
 * PRD Reference: Section 11 - Performance and Reputation tracking
 */
export default function StudentAnalytics() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          // Use backend API for analytics stats
          const { api } = await import("@/src/api/client");
          const backendResponse = await api.get<{
            totalApplications: number;
            activeApplications: number;
            completedProjects: number;
            activeProjects: number;
            totalBudget: number;
            totalEarnings: number;
            activeProjectsChange: number;
            totalBudgetChange: number;
          }>("/api/v1/analytics/student");
          
          // Map backend response to DashboardStats
          const dashboardStats: DashboardStats = {
            totalApplications: backendResponse.totalApplications,
            activeApplications: backendResponse.activeApplications,
            activeProjects: backendResponse.activeProjects,
            totalBudget: backendResponse.totalBudget,
            totalEarnings: backendResponse.totalEarnings,
            completedProjects: backendResponse.completedProjects,
            activeProjectsChange: backendResponse.activeProjectsChange,
            totalBudgetChange: backendResponse.totalBudgetChange,
          };

          // Get user's applications and projects
          const [applicationsData] = await Promise.all([
            applicationService.getUserApplications(),
          ]);

          // Get projects from applications
          const projectIds = applicationsData
            .map((app) => app.projectId)
            .filter((id, index, self) => self.indexOf(id) === index);
          
          // Fetch all projects (with high limit to get all student's projects)
          const allProjectsResult = await projectService.getAllProjects({ limit: 1000 });
          const studentProjects = allProjectsResult.projects.filter((p) => projectIds.includes(p.id));

          setStats(dashboardStats);
          setProjects(studentProjects);
          setApplications(applicationsData);
        }
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  /**
   * Chart data - applications over time
   * Shows trend of applications submitted by student
   */
  const applicationTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthApplications = applications.filter((app) => {
        const created = new Date(app.createdAt).getMonth();
        return created <= index;
      });
      return {
        name: month,
        "Applications": monthApplications.length,
        "Accepted": monthApplications.filter((app) => app.status === "ACCEPTED").length,
      };
    });
  }, [applications]);

  /**
   * Chart data - applications by status
   * Shows distribution of application statuses
   */
  const applicationsByStatusData = useMemo(() => {
    const statusMap = applications.reduce((acc, app) => {
      const status = app.status === "SUBMITTED" ? "Submitted" :
        app.status === "SHORTLISTED" ? "Shortlisted" :
        app.status === "WAITLIST" ? "Waitlisted" :
        app.status === "ACCEPTED" ? "Accepted" :
        app.status === "REJECTED" ? "Rejected" : "Pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusMap).map(([name, count]) => ({
      name,
      "Applications": count,
    }));
  }, [applications]);

  /**
   * Chart data - project performance by status
   * Shows student's projects grouped by status
   */
  const projectPerformanceData = useMemo(() => {
    // Use actual student projects from applications
    const statusMap = projects.reduce((acc, project) => {
      const status = project.status === "in-progress" ? "In Progress" :
        project.status === "completed" ? "Completed" :
        project.status === "on-hold" ? "On Hold" : "Published";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusMap).map(([name, count]) => ({
      name,
      "Projects": count,
    }));
  }, [projects]);

  /**
   * Chart data - earnings over time
   * Shows earnings trend from completed projects
   */
  const earningsTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      // Calculate earnings from completed projects up to this month
      const monthIndex = (currentMonth - (5 - index) + 12) % 12;
      const monthProjects = projects.filter((project) => {
        if (project.status !== "completed") return false;
        const projectDate = new Date(project.createdAt || project.updatedAt);
        return projectDate.getMonth() <= monthIndex;
      });
      
      const earnings = monthProjects.reduce((sum, project) => {
        return sum + (project.budget || 0);
      }, 0);
      
      const budget = projects.filter((project) => {
        const projectDate = new Date(project.createdAt || project.updatedAt);
        return projectDate.getMonth() <= monthIndex;
      }).reduce((sum, project) => {
        return sum + (project.budget || 0);
      }, 0);
      
      return {
        name: month,
        "Earnings": earnings,
        "Budget": budget,
      };
    });
  }, [projects, stats]);

  if (loading || !stats) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Analytics</h1>
        <p className="text-secondary">Track your performance, applications, and earnings</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText size={20} />}
          title="Total Applications"
          value={applications.length}
        />
        <StatCard
          icon={<Briefcase size={20} />}
          title="Active Projects"
          value={stats.activeProjects}
          change={stats.activeProjectsChange}
        />
        <StatCard
          icon={<Award size={20} />}
          title="Completed Projects"
          value={stats.completedProjects}
        />
        <StatCard
          icon={<DollarSign size={20} />}
          title="Total Earnings"
          value={`$${Math.round(stats.totalEarnings || stats.totalBudget || 0).toLocaleString()}`}
          change={stats.totalBudgetChange}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Application Trends"
          data={applicationTrendData}
          lines={[
            { key: "Applications", label: "Total Applications" },
            { key: "Accepted", label: "Accepted" },
          ]}
        />
        <BarChart
          title="Applications by Status"
          data={applicationsByStatusData}
          bars={[
            { key: "Applications", label: "Applications" },
          ]}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Earnings Over Time"
          data={earningsTrendData}
          lines={[
            { key: "Earnings", label: "Earnings" },
            { key: "Budget", label: "Project Budget" },
          ]}
        />
        <BarChart
          title="Project Performance"
          data={projectPerformanceData}
          bars={[
            { key: "Projects", label: "Projects" },
          ]}
        />
      </div>
    </div>
  );
}

