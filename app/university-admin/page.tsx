"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import LineChart from "@/src/components/base/LineChart";
import BarChart from "@/src/components/base/BarChart";
import { OrganizationI } from "@/src/models/organization";
import { dashboardService, UniversityAdminDashboardStats } from "@/src/services/dashboardService";
import { useAuthStore } from "@/src/store";
import { ShieldCheck, Users, FileText, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/src/api/client";

/**
 * University Admin Dashboard - overview of organization, students, and applications
 */
export default function UniversityAdminDashboard() {
  const { user, organization: storedOrganization } = useAuthStore();
  const router = useRouter();
  const [organization, setOrganization] = useState<OrganizationI | null>(null);
  const [stats, setStats] = useState<UniversityAdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // For university-admin, use organization.id or user.orgId
        const universityId = storedOrganization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);
        if (!universityId) {
          setLoading(false);
          return;
        }

        const { organizationService } = await import("@/src/services/organizationService");
        const [org, dashboardStats] = await Promise.all([
          organizationService.getOrganization(universityId.toString()).catch(() => null),
          dashboardService.getUniversityAdminDashboardStats(universityId.toString()),
        ]);

        setOrganization(org || storedOrganization);
        setStats({
          ...dashboardStats,
          departmentStats: dashboardStats.departmentStats || [],
          recentProjects: dashboardStats.recentProjects || [],
        });
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.orgId, user?.universityId, storedOrganization?.id]);

  // Chart data - student growth over time
  const studentGrowthData = useMemo(() => {
    if (stats?.studentTrend && stats.studentTrend.length > 0) {
      return stats.studentTrend.map((point) => ({
        name: point.month,
        Students: point.count,
      }));
    }

    if (!stats) return [];
    return [
      { name: "Current", Students: stats.totalStudents },
    ];
  }, [stats]);

  // Chart data - projects by department (for bar chart)
  const projectsByDepartmentData = useMemo(() => {
    if (!stats?.departmentStats || stats.departmentStats.length === 0) return [];

    return stats.departmentStats.map((dept) => ({
      name: dept.departmentName,
      Active: dept.activeProjects,
      Completed: dept.completedProjects,
      Pending: dept.pendingProjects,
    }));
  }, [stats]);

  // Chart data - projects by status using backend stats
  const projectsByStatusData = useMemo(() => {
    if (!stats) return [];

    const totals = stats.departmentStats.reduce(
      (acc, dept) => {
        acc.active += dept.activeProjects;
        acc.completed += dept.completedProjects;
        acc.pending += dept.pendingProjects;
        return acc;
      },
      { active: 0, completed: 0, pending: 0 }
    );

    return [
      { name: "Active", Projects: totals.active },
      { name: "Pending Review", Projects: totals.pending },
      { name: "Completed", Projects: totals.completed },
    ];
  }, [stats]);

  const formatStatus = (status: string) =>
    status
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

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
        <div className="flex items-center gap-3 mb-2">
          {organization?.logo && (
            <img
              style={{
                mixBlendMode: "multiply"
              }}
              src={
                organization.logo.startsWith("http")
                  ? organization.logo
                  : `${BASE_URL}/${organization.logo}`
              }
              alt={organization.name}
              className="h-12 w-auto rounded-lg object-contain mix-blend-multiply"
            />
          )}
          <div>
            <h1 className="text-2xl font-semibold text-default">
              {organization?.name || "University Workspace"}
            </h1>
            <p className="text-sm text-secondary">
              Welcome back, {user?.name?.split(" ")[0] || "admin"}. These insights reflect live activity in your
              institution.
            </p>
          </div>
        </div>
      </div>

      {/* Department & recent project overview */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Projects by Department - Bar Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-default">Projects by Department</h2>
                <p className="text-sm text-secondary">
                  {organization?.name ? `${organization.name} · Active vs. Completed` : "Active vs. Completed"}
                </p>
              </div>
              {/* <button
                onClick={() => router.push("/university-admin/projects")}
                className="text-sm font-medium text-secondary hover:text-default hover:underline"
              >
                View All Projects
              </button> */}
            </div>
            {projectsByDepartmentData.length > 0 ? (
              <div className="[&>div]:bg-transparent [&>div]:shadow-none [&>div]:p-0">
                <BarChart
                  title=""
                  data={projectsByDepartmentData}
                  bars={[
                    { key: "Active", label: "Active", color: "var(--primary)" },
                    { key: "Completed", label: "Completed", color: "var(--text-success)" },
                    { key: "Pending", label: "Pending", color: "var(--text-warning)" },
                  ]}
                  height={300}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-custom p-6 text-center text-sm text-muted">
                No departmental data yet. Projects will appear here as soon as they are created.
              </div>
            )}
          </Card>

          {/* Recent Projects */}
          <Card>
            <p className="text-sm font-semibold text-secondary mb-3">Recent Projects</p>
            {stats.recentProjects && stats.recentProjects.length > 0 ? (
              <div className="space-y-2">
                {stats.recentProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/university-admin/projects/${project.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg hover-bg-pale cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-sm text-default">{project.title}</p>
                      <p className="text-xs text-secondary">{project.departmentName}</p>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-muted ml-4">
                      {formatStatus(project.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-custom p-4 text-center text-sm text-muted">
                No recent projects in this workspace.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Secondary Stats - Moved below Current Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {organization && (
          <Card>
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-primary" />
              <div>
                <p className="text-sm text-secondary">KYC Status</p>
                <StatusIndicator status={organization.kycStatus} />
              </div>
            </div>
          </Card>
        )}
        {stats && (
          <>
            <StatCard
              icon={<Users size={20} />}
              title="Total Students"
              value={stats.totalStudents}
              change={stats.totalStudentsChange}
            />
            <StatCard
              icon={<FileText size={20} />}
              title="Active Projects"
              value={stats.activeProjects}
              change={stats.activeProjectsChange}
            />
            <StatCard
              icon={<AlertCircle size={20} />}
              title="Pending Reviews"
              value={stats.pendingReviews}
            />
          </>
        )}
      </div>

      {/* Analytics - Moved to Secondary Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
      )}

      {/* Quick Actions - Secondary Section */}
      {/* <Card title="Quick Actions" className="flex-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => router.push('/university-admin/uploads')}
            className="p-4 bg-pale rounded-lg hover-bg-very-pale cursor-pointer transition-all duration-200"
          >
            <h3 className="text-[1rem] font-[600] mb-2">Bulk Upload</h3>
            <p className="text-[0.875rem] opacity-60">Upload students, supervisors, or courses</p>
          </div>
          <div 
            onClick={() => router.push('/university-admin/screening')}
            className="p-4 bg-pale rounded-lg hover-bg-very-pale cursor-pointer transition-all duration-200"
          >
            <h3 className="text-[1rem] font-[600] mb-2">Screen Applications</h3>
            <p className="text-[0.875rem] opacity-60">Review and score project applications</p>
          </div>
          <div 
            onClick={() => router.push('/university-admin/offers')}
            className="p-4 bg-pale rounded-lg hover-bg-very-pale cursor-pointer transition-all duration-200"
          >
            <h3 className="text-[1rem] font-[600] mb-2">Manage Offers</h3>
            <p className="text-[0.875rem] opacity-60">Issue offers and manage assignments</p>
          </div>
        </div>
      </Card> */}
    </div>
  );
}

