"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import LineChart from "@/src/components/base/LineChart";
import BarChart from "@/src/components/base/BarChart";
import { ProjectI } from "@/src/models/project";
import { MilestoneI } from "@/src/models/milestone";
import { projectService } from "@/src/services/projectService";
import { milestoneService } from "@/src/services/milestoneService";
import { dashboardService, DashboardStats } from "@/src/services/dashboardService";
import { useAuthStore } from "@/src/store";
import { Briefcase, Clock, DollarSign, Users } from "lucide-react";
import ProjectCard from "@/src/components/screen/supervisor/projects/ProjectCard";

/**
 * Extended dashboard stats with supervisor-specific metrics
 */
interface SupervisorProjectStats extends DashboardStats {
  pendingReviews: number;
  completedMilestones: number;
}

/**
 * Supervisor Project Dashboard - overview of all supervised projects
 */
export default function SupervisorProjects() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [milestones, setMilestones] = useState<MilestoneI[]>([]);
  const [stats, setStats] = useState<SupervisorProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allProjects, dashboardStats] = await Promise.all([
          projectService.getAllProjects(),
          dashboardService.getSupervisorDashboardStats(user?.id || ""),
        ]);
        
        // Filter projects supervised by this supervisor
        const supervisedProjects = allProjects.filter(
          (p) => p.supervisorId === user?.id
        );
        setProjects(supervisedProjects);
        
        // Load milestones for all supervised projects
        const allMilestones: MilestoneI[] = [];
        for (const project of supervisedProjects) {
          try {
            const projectMilestones = await milestoneService.getProjectMilestones(project.id);
            allMilestones.push(...projectMilestones);
          } catch (error) {
            console.error(`Failed to load milestones for project ${project.id}:`, error);
          }
        }
        setMilestones(allMilestones);
        
        // Combine stats
        const combinedStats: SupervisorProjectStats = {
          ...dashboardStats,
          pendingReviews: allMilestones.filter(
            (m) => m.status === "SUBMITTED" || m.status === "SUPERVISOR_REVIEW"
          ).length,
          completedMilestones: allMilestones.filter((m) => m.status === "COMPLETED").length,
        };
        setStats(combinedStats);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  // Chart data - milestone status over time
  const milestoneTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthMilestones = milestones.filter((m) => {
        const created = new Date(m.createdAt).getMonth();
        return created <= index;
      });
      return {
        name: month,
        "Total Milestones": monthMilestones.length,
        "Completed": monthMilestones.filter((m) => m.status === "COMPLETED").length,
      };
    });
  }, [milestones]);

  // Chart data - projects by status
  const projectsByStatusData = useMemo(() => {
    const statusMap = projects.reduce((acc, project) => {
      const status = project.status === "in-progress" ? "In Progress" : 
                     project.status === "completed" ? "Completed" : 
                     project.status === "on-hold" ? "On Hold" : "Draft";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusMap).map(([name, count]) => ({
      name,
      "Projects": count,
    }));
  }, [projects]);

  if (loading || !stats) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Project Dashboard</h1>
        <p className="text-secondary">Overview of all projects under your supervision</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Briefcase size={20} />}
            title="Total Projects"
            value={stats.totalProjects}
          />
          <StatCard
            icon={<Users size={20} />}
            title="Active Projects"
            value={stats.activeProjects}
            change={stats.activeProjectsChange}
          />
          <StatCard
            icon={<Clock size={20} />}
            title="Pending Reviews"
            value={stats.pendingReviews}
          />
          <StatCard
            icon={<DollarSign size={20} />}
            title="Completed"
            value={stats.completedMilestones}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Milestone Trends"
          data={milestoneTrendData}
          lines={[
            { key: "Total Milestones", label: "Total Milestones" },
            { key: "Completed", label: "Completed" },
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

      {/* Projects List */}
      <Card title="Supervised Projects">
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} milestones={milestones} />
          ))}
          {projects.length === 0 && (
            <p className="text-center text-muted py-8">No projects under supervision</p>
          )}
        </div>
      </Card>
    </div>
  );
}

