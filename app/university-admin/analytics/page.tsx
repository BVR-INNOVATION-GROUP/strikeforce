"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import LineChart from "@/src/components/base/LineChart";
import BarChart from "@/src/components/base/BarChart";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { OrganizationI } from "@/src/models/organization";
import { projectService } from "@/src/services/projectService";
import { dashboardService, UniversityAdminDashboardStats } from "@/src/services/dashboardService";
import { useAuthStore } from "@/src/store";

/**
 * University Admin Analytics - comprehensive analytics dashboard
 */
export default function UniversityAdminAnalytics() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [organization, setOrganization] = useState<OrganizationI | null>(null);
  const [stats, setStats] = useState<UniversityAdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [applicationsData, projectsData, orgData, dashboardStats] = await Promise.all([
          import("@/src/data/mockApplications.json"),
          projectService.getAllProjects(),
          import("@/src/data/mockOrganizations.json"),
          dashboardService.getUniversityAdminDashboardStats(user?.universityId || ""),
        ]);

        setApplications(applicationsData.default as ApplicationI[]);
        setProjects(projectsData);
        
        const org = (orgData.default as OrganizationI[]).find(
          (o) => o.id === user?.universityId
        );
        setOrganization(org || null);
        setStats(dashboardStats);
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.universityId]);

  // Chart data - student growth over time
  const studentGrowthData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const baseStudents = stats?.totalStudents || 100;
    return months.map((month, index) => ({
      name: month,
      "Students": Math.round(baseStudents * (1 + index * 0.05)),
    }));
  }, [stats]);

  // Chart data - projects by status
  const projectsByStatusData = useMemo(() => {
    return [
      { name: "Active", "Projects": stats?.activeProjects || 0 },
      { name: "Pending Review", "Projects": stats?.pendingReviews || 0 },
      { name: "Completed", "Projects": (stats?.totalStudents || 0) - (stats?.activeProjects || 0) },
    ];
  }, [stats]);

  // Chart data - applications over time
  const applicationTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthApplications = applications.filter((app) => {
        const created = new Date(app.createdAt).getMonth();
        return created <= index;
      });
      return {
        name: month,
        "Total Applications": monthApplications.length,
        "Shortlisted": monthApplications.filter((a) => a.status === "SHORTLISTED").length,
      };
    });
  }, [applications]);

  // Chart data - applications by status
  const applicationsByStatusData = useMemo(() => {
    const statusMap = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusMap).map(([name, count]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      "Applications": count,
    }));
  }, [applications]);

  // Chart data - offers over time
  const offerTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthOffers = applications.filter((app) => {
        if (!app.createdAt) return false;
        const created = new Date(app.createdAt).getMonth();
        return created <= index;
      });
      return {
        name: month,
        "Total Offers": monthOffers.filter((a) => a.status === "OFFERED" || a.status === "ACCEPTED").length,
        "Accepted": monthOffers.filter((a) => a.status === "ACCEPTED").length,
      };
    });
  }, [applications]);

  // Chart data - offers by status
  const offersByStatusData = useMemo(() => {
    const statusMap = applications.reduce((acc, app) => {
      if (["SHORTLISTED", "OFFERED", "ACCEPTED", "ASSIGNED"].includes(app.status)) {
        acc[app.status] = (acc[app.status] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusMap).map(([name, count]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      "Applications": count,
    }));
  }, [applications]);

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Analytics</h1>
        <p className="text-[0.875rem] opacity-60">Comprehensive analytics and insights</p>
      </div>

      {/* Overview Section */}
      {stats && (
        <Card title="Overview" className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart
              title="Student Growth"
              data={studentGrowthData}
              lines={[
                { key: "Students", label: "Total Students" },
              ]}
            />
            <BarChart
              title="Projects by Status"
              data={projectsByStatusData}
              bars={[
                { key: "Projects", label: "Projects" },
              ]}
            />
          </div>
        </Card>
      )}

      {/* Applications Analytics */}
      <Card title="Applications Analytics" className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart
            title="Application Trends"
            data={applicationTrendData}
            lines={[
              { key: "Total Applications", label: "Total Applications" },
              { key: "Shortlisted", label: "Shortlisted" },
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
      </Card>

      {/* Offers Analytics */}
      <Card title="Offers & Assignments Analytics" className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart
            title="Offer Trends"
            data={offerTrendData}
            lines={[
              { key: "Total Offers", label: "Total Offers" },
              { key: "Accepted", label: "Accepted" },
            ]}
          />
          <BarChart
            title="Applications by Status"
            data={offersByStatusData}
            bars={[
              { key: "Applications", label: "Applications" },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

