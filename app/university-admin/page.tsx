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
        setStats(dashboardStats);
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
        <h1 className="text-[1rem] font-[600] mb-2">Dashboard</h1>
        <p className="text-[0.875rem] opacity-60">Welcome, {user?.name}</p>
      </div>

      {/* Stats */}
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

      {/* Charts */}
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

      {/* Quick Actions */}
      <Card title="Quick Actions" className="flex-1 min-h-0">
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
      </Card>
    </div>
  );
}

