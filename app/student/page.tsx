"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import CurrentProjectsCard from "@/src/components/screen/dashboard/CurrentProjectsCard";
import { dashboardService, DashboardStats } from "@/src/services/dashboardService";
import { projectService } from "@/src/services/projectService";
import { applicationService } from "@/src/services/applicationService";
import { useAuthStore } from "@/src/store";
import { Search, Briefcase, Award, DollarSign, TrendingUp, FileText, Download } from "lucide-react";
import { ProjectI } from "@/src/models/project";
import { ApplicationI } from "@/src/models/application";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Student Dashboard - overview with stats and quick access to Find Projects
 */
export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const [dashboardStats, projectsData, applicationsData] = await Promise.all([
            dashboardService.getStudentDashboardStats(),
            projectService.getAllProjects(),
            applicationService.getUserApplications(),
          ]);
          setStats(dashboardStats);
          setProjects(projectsData);
          setApplications(applicationsData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  // Get student's projects (projects they've applied to or are working on)
  const studentProjects = useMemo(() => {
    if (!user?.id) return [];
    const appliedProjectIds = new Set(applications.map((a) => a.projectId.toString()));
    return projects.filter((p) => appliedProjectIds.has(p.id.toString()));
  }, [projects, applications, user?.id]);

  // Get pending applications
  const pendingApplications = useMemo(() => {
    return applications.filter((a) => 
      a.status === "SUBMITTED" || a.status === "SHORTLISTED" || a.status === "WAITLIST"
    );
  }, [applications]);

  if (loading || !stats) {
    return (
      <div className="w-full flex flex-col min-h-full">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 mb-6">
          <Skeleton width={200} height={32} rounded="md" className="mb-2" />
          <Skeleton width={300} height={16} rounded="md" />
        </div>

        {/* Current Projects Card Skeleton */}
        <div className="bg-paper rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <Skeleton width={250} height={24} rounded="md" className="mb-2" />
              <Skeleton width={300} height={16} rounded="md" />
            </div>
            <Skeleton width={80} height={20} rounded="md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-pale rounded-lg">
                <Skeleton width={24} height={24} rounded="md" />
                <div className="flex-1">
                  <Skeleton width={60} height={32} rounded="md" className="mb-2" />
                  <Skeleton width={120} height={14} rounded="md" />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-custom">
            <Skeleton width={180} height={18} rounded="md" className="mb-2" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-2 mb-2">
                <Skeleton width="60%" height={16} rounded="md" />
                <Skeleton width={60} height={14} rounded="md" />
              </div>
            ))}
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-paper rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton width={48} height={48} rounded="lg" />
                <Skeleton width={150} height={20} rounded="md" />
              </div>
              <Skeleton width="100%" height={16} rounded="md" className="mb-4" />
              <Skeleton width={120} height={16} rounded="md" className="ml-auto" />
            </div>
          ))}
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-paper rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton width={24} height={24} rounded="md" />
                <Skeleton width={120} height={16} rounded="md" />
              </div>
              <Skeleton width={80} height={32} rounded="md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-sm text-slate-600">Welcome back, {user?.name || "Student"}</p>
      </div>

      {/* Current Projects Summary Card - The Heartbeat */}
      <CurrentProjectsCard
        projects={studentProjects}
        userRole="student"
        onViewAll={() => {}}
        loading={loading}
      />

      {/* Purposeful Student Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Available Projects */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = "/student/find"}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-slate-100 rounded-lg">
              <Search size={20} className="text-slate-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Available Projects</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Discover and apply to new projects that match your skills
          </p>
          <div className="text-right">
            <span className="text-sm font-medium text-slate-700 hover:underline">Browse Projects →</span>
          </div>
        </Card>

        {/* Applications in Progress */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-slate-100 rounded-lg">
              <FileText size={20} className="text-slate-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Applications in Progress</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            {pendingApplications.length} pending application{pendingApplications.length !== 1 ? 's' : ''}
          </p>
          <div className="text-right">
            <span className="text-sm font-medium text-slate-700">{pendingApplications.length} Active</span>
          </div>
        </Card>

        {/* Completed Projects */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-slate-100 rounded-lg">
              <Award size={20} className="text-slate-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Completed Projects</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Download certificates and add to your CV
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Download size={16} />
            <span className="font-medium">{stats?.completedProjects || 0} Completed</span>
          </div>
        </Card>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Briefcase size={20} />}
          title="Active Projects"
          value={stats?.activeProjects || 0}
          change={stats?.activeProjectsChange}
        />
        <StatCard
          icon={<Award size={20} />}
          title="Completed"
          value={stats?.completedProjects || 0}
        />
        <StatCard
          icon={<DollarSign size={20} />}
          title="Total Earnings"
          value={`$${(stats?.totalBudget || 0).toLocaleString()}`}
          change={stats?.totalBudgetChange}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Total Projects"
          value={stats?.totalProjects || 0}
        />
      </div>
    </div>
  );
}
