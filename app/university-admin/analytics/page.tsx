"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import LineChart from "@/src/components/base/LineChart";
import BarChart from "@/src/components/base/BarChart";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { OrganizationI } from "@/src/models/organization";
import { UserI } from "@/src/models/user";
import { DepartmentI } from "@/src/models/project";
import { projectService } from "@/src/services/projectService";
import { dashboardService, UniversityAdminDashboardStats, UniversityAdminAnalytics } from "@/src/services/dashboardService";
import { useAuthStore } from "@/src/store";
import { applicationRepository } from "@/src/repositories/applicationRepository";
import { organizationService } from "@/src/services/organizationService";
import { userRepository } from "@/src/repositories/userRepository";
import { departmentService } from "@/src/services/departmentService";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * University Admin Analytics - comprehensive analytics dashboard
 */
export default function UniversityAdminAnalytics() {
  const { user, organization: storedOrganization } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [students, setStudents] = useState<UserI[]>([]);
  const [supervisors, setSupervisors] = useState<UserI[]>([]);
  const [departments, setDepartments] = useState<DepartmentI[]>([]);
  const [organization, setOrganization] = useState<OrganizationI | null>(null);
  const [stats, setStats] = useState<UniversityAdminDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<UniversityAdminAnalytics | null>(null);
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

        // Load all applications and filter by university projects
        const allApplications = await applicationRepository.getAll();
        const allProjects = await projectService.getAllProjects();

        const numericUniversityId = typeof universityId === 'string' ? parseInt(universityId, 10) : universityId;

        // Filter projects for this university
        const universityProjects = allProjects.filter(
          (p) => {
            const projectUniId = typeof p.universityId === 'string' ? parseInt(p.universityId, 10) : p.universityId;
            return projectUniId === numericUniversityId;
          }
        );

        // Filter applications for university projects
        const universityApplicationIds = new Set(universityProjects.map(p => p.id));
        const universityApplications = allApplications.filter(
          (a) => universityApplicationIds.has(a.projectId)
        );
        setApplications(universityApplications);
        setProjects(universityProjects);

        // Load organization (use stored one if available)
        const org = storedOrganization || await organizationService.getOrganization(universityId.toString()).catch(() => null);
        setOrganization(org);

        // Load students for this university
        const allStudents = await userRepository.getByRole("student");
        const universityStudents = allStudents.filter(
          (s) => {
            const studentUniId = typeof s.universityId === 'string' ? parseInt(s.universityId, 10) : s.universityId;
            return studentUniId === numericUniversityId;
          }
        );
        setStudents(universityStudents);

        // Load supervisors for this university
        const allSupervisors = await userRepository.getByRole("supervisor");
        const universitySupervisors = allSupervisors.filter(
          (s) => {
            const supervisorUniId = typeof s.universityId === 'string' ? parseInt(s.universityId, 10) : s.universityId;
            return supervisorUniId === numericUniversityId;
          }
        );
        setSupervisors(universitySupervisors);

        // Load departments for this university
        const departmentsData = await departmentService.getAllDepartments(numericUniversityId);
        setDepartments(departmentsData);

        // Load dashboard stats and analytics
        const [dashboardStats, analyticsData] = await Promise.all([
          dashboardService.getUniversityAdminDashboardStats(universityId.toString()),
          dashboardService.getUniversityAdminAnalytics(universityId.toString()).catch((error) => {
            console.error("Failed to load analytics:", error);
            return null;
          }),
        ]);
        setStats(dashboardStats);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.orgId, user?.universityId, storedOrganization?.id]);

  // Chart data - student growth over time (using actual creation dates)
  const studentGrowthData = useMemo(() => {
    // Get last 6 months
    const months: string[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`);
    }

    // Count students created in each month
    const studentCounts = months.map((monthLabel, index) => {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const count = students.filter((student) => {
        if (!student.createdAt) return false;
        const createdDate = new Date(student.createdAt);
        return createdDate <= targetDate;
      }).length;
      return {
        name: monthLabel,
        "Students": count,
      };
    });

    return studentCounts;
  }, [students]);

  // Chart data - projects by status (using actual project data)
  const projectsByStatusData = useMemo(() => {
    const statusCounts = projects.reduce((acc, project) => {
      const status = project.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Map status to readable names
    const statusMap: Record<string, string> = {
      "in-progress": "In Progress",
      "on-hold": "On Hold",
      "completed": "Completed",
      "pending": "Pending",
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1),
      "Projects": count,
    }));
  }, [projects]);

  // Chart data - applications over time (using actual dates)
  const applicationTrendData = useMemo(() => {
    // Get last 6 months
    const months: string[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`);
    }

    return months.map((monthLabel, index) => {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthApplications = applications.filter((app) => {
        if (!app.createdAt) return false;
        const createdDate = new Date(app.createdAt);
        return createdDate <= targetDate;
      });
      return {
        name: monthLabel,
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

  // Chart data - offers over time (using actual dates)
  const offerTrendData = useMemo(() => {
    // Get last 6 months
    const months: string[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`);
    }

    return months.map((monthLabel, index) => {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthOffers = applications.filter((app) => {
        if (!app.createdAt) return false;
        const createdDate = new Date(app.createdAt);
        return createdDate <= targetDate;
      });
      return {
        name: monthLabel,
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

  // Chart data - students by department
  const studentsByDepartmentData = useMemo(() => {
    const deptCounts = students.reduce((acc, student) => {
      const deptId = student.departmentId;
      if (deptId) {
        const dept = departments.find(d => d.id === deptId);
        const deptName = dept?.name || `Department ${deptId}`;
        acc[deptName] = (acc[deptName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(deptCounts).map(([name, count]) => ({
      name,
      "Students": count,
    }));
  }, [students, departments]);

  // Chart data - supervisors by department
  const supervisorsByDepartmentData = useMemo(() => {
    const deptCounts = supervisors.reduce((acc, supervisor) => {
      const deptId = supervisor.departmentId;
      if (deptId) {
        const dept = departments.find(d => d.id === deptId);
        const deptName = dept?.name || `Department ${deptId}`;
        acc[deptName] = (acc[deptName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(deptCounts).map(([name, count]) => ({
      name,
      "Supervisors": count,
    }));
  }, [supervisors, departments]);

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-full">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 mb-8">
          <Skeleton width={200} height={24} rounded="md" className="mb-2" />
          <Skeleton width={300} height={16} rounded="md" />
        </div>

        {/* Overview Card Skeleton */}
        <div className="bg-paper rounded-lg p-6 mb-8">
          <Skeleton width={150} height={24} rounded="md" className="mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton width={200} height={24} rounded="md" className="mb-4" />
                <Skeleton width="100%" height={300} rounded="md" />
              </div>
            ))}
          </div>
        </div>

        {/* Applications Analytics Skeleton */}
        <div className="bg-paper rounded-lg p-6 mb-8">
          <Skeleton width={200} height={24} rounded="md" className="mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton width={200} height={24} rounded="md" className="mb-4" />
                <Skeleton width="100%" height={300} rounded="md" />
              </div>
            ))}
          </div>
        </div>

        {/* Additional Analytics Skeleton */}
        <div className="bg-paper rounded-lg p-6">
          <Skeleton width={200} height={24} rounded="md" className="mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton width={200} height={24} rounded="md" className="mb-4" />
                <Skeleton width="100%" height={300} rounded="md" />
              </div>
            ))}
          </div>
        </div>
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

      {/* Department Analytics */}
      {departments.length > 0 && (
        <Card title="Department Analytics" className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart
              title="Students by Department"
              data={studentsByDepartmentData}
              bars={[
                { key: "Students", label: "Students" },
              ]}
            />
            <BarChart
              title="Supervisors by Department"
              data={supervisorsByDepartmentData}
              bars={[
                { key: "Supervisors", label: "Supervisors" },
              ]}
            />
          </div>
        </Card>
      )}

      {/* Revenue & Earnings Analytics */}
      <Card title="Revenue & Earnings Analytics" className="mb-8">
        {analytics ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-pale rounded-lg">
                <p className="text-[0.8125rem] opacity-60 mb-1">Total Revenue</p>
                <p className="text-[1.5rem] font-[600]">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'UGX',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(analytics.totalRevenue)}
                </p>
                <p className="text-xs text-secondary mt-1">From completed partner projects</p>
              </div>
              <div className="p-4 bg-pale rounded-lg">
                <p className="text-[0.8125rem] opacity-60 mb-1">Total Student Earnings</p>
                <p className="text-[1.5rem] font-[600]">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'UGX',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(analytics.totalStudentEarnings)}
                </p>
                <p className="text-xs text-secondary mt-1">
                  {analytics.studentsEarningCount} students earning
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChart
                title="Revenue Trend"
                data={analytics.revenueTrend.map((point) => ({
                  name: point.month,
                  Revenue: point.value,
                }))}
                lines={[
                  { key: "Revenue", label: "Revenue (UGX)" },
                ]}
              />
              <LineChart
                title="Student Earnings Trend"
                data={analytics.earningsTrend.map((point) => ({
                  name: point.month,
                  Earnings: point.value,
                }))}
                lines={[
                  { key: "Earnings", label: "Earnings (UGX)" },
                ]}
              />
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-custom p-6 text-center text-sm text-muted">
            Analytics data is loading or unavailable. Please check your connection and try again.
          </div>
        )}
      </Card>

      {/* Demographic Analytics */}
      <Card title="Demographic Analytics" className="mb-8">
        <p className="text-sm text-secondary mb-6">
          Track student demographics for research and reporting purposes
        </p>
        {analytics ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {analytics.genderDistribution.length > 0 ? (
              <BarChart
                title="Gender Distribution"
                data={analytics.genderDistribution.map((point) => ({
                  name: point.gender,
                  Students: point.count,
                }))}
                bars={[
                  { key: "Students", label: "Students" },
                ]}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-custom p-4 text-center text-sm text-muted">
                No gender data available
              </div>
            )}
            {analytics.branchDistribution.length > 0 ? (
              <BarChart
                title="Branch Distribution"
                data={analytics.branchDistribution.map((point) => ({
                  name: point.branchName,
                  Students: point.count,
                }))}
                bars={[
                  { key: "Students", label: "Students" },
                ]}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-custom p-4 text-center text-sm text-muted">
                No branch data available
              </div>
            )}
            {analytics.districtDistribution.length > 0 ? (
              <BarChart
                title="District Distribution"
                data={analytics.districtDistribution
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10)
                  .map((point) => ({
                    name: point.district,
                    Students: point.count,
                  }))}
                bars={[
                  { key: "Students", label: "Students" },
                ]}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-custom p-4 text-center text-sm text-muted">
                No district data available
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-custom p-6 text-center text-sm text-muted">
            Analytics data is loading or unavailable. Please check your connection and try again.
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      {stats && (
        <Card title="Summary Statistics" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-pale rounded-lg">
              <p className="text-[0.8125rem] opacity-60 mb-1">Total Students</p>
              <p className="text-[1.5rem] font-[600]">{stats.totalStudents}</p>
            </div>
            <div className="p-4 bg-pale rounded-lg">
              <p className="text-[0.8125rem] opacity-60 mb-1">Total Supervisors</p>
              <p className="text-[1.5rem] font-[600]">{supervisors.length}</p>
            </div>
            <div className="p-4 bg-pale rounded-lg">
              <p className="text-[0.8125rem] opacity-60 mb-1">Active Projects</p>
              <p className="text-[1.5rem] font-[600]">{stats.activeProjects}</p>
            </div>
            <div className="p-4 bg-pale rounded-lg">
              <p className="text-[0.8125rem] opacity-60 mb-1">Total Applications</p>
              <p className="text-[1.5rem] font-[600]">{applications.length}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}


