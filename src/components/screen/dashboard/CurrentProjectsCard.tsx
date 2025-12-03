/**
 * Current Projects Summary Card Component
 * Displays the "heartbeat" of the system - current projects overview
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import { ProjectI } from "@/src/models/project";
import { useRouter } from "next/navigation";
import { Briefcase, CheckCircle, Clock, AlertCircle } from "lucide-react";

export interface CurrentProjectsCardProps {
  projects: ProjectI[];
  userRole: "university-admin" | "partner" | "student";
  organizationName?: string;
  onViewAll?: () => void;
}

const CurrentProjectsCard: React.FC<CurrentProjectsCardProps> = ({
  projects,
  userRole,
  organizationName,
  onViewAll,
}) => {
  const router = useRouter();

  // Filter projects by status
  const activeProjects = projects.filter((p) => p.status === "in-progress");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const pendingProjects = projects.filter((p) => p.status === "pending" || p.status === "draft");

  const getRoleSpecificContent = () => {
    switch (userRole) {
      case "university-admin":
        return {
          title: "Projects by Department",
          subtitle: organizationName ? `${organizationName} - Active vs. Completed` : "Active vs. Completed",
          stats: [
            { label: "Active Projects", value: activeProjects.length, icon: <Clock size={18} className="text-primary" /> },
            { label: "Completed", value: completedProjects.length, icon: <CheckCircle size={18} className="text-muted-green" /> },
            { label: "Pending Review", value: pendingProjects.length, icon: <AlertCircle size={18} className="text-muted" /> },
          ],
        };
      case "partner":
        return {
          title: "Projects You've Initiated",
          subtitle: "Universities Engaged",
          stats: [
            { label: "Active Projects", value: activeProjects.length, icon: <Briefcase size={18} className="text-primary" /> },
            { label: "Completed", value: completedProjects.length, icon: <CheckCircle size={18} className="text-muted-green" /> },
            { label: "Draft", value: pendingProjects.length, icon: <Clock size={18} className="text-secondary" /> },
          ],
        };
      case "student":
        return {
          title: "Projects You're Involved In",
          subtitle: "Pending Applications",
          stats: [
            { label: "Active Projects", value: activeProjects.length, icon: <Briefcase size={18} className="text-primary" /> },
            { label: "Completed", value: completedProjects.length, icon: <CheckCircle size={18} className="text-muted-green" /> },
            { label: "Pending Applications", value: pendingProjects.length, icon: <Clock size={18} className="text-muted" /> },
          ],
        };
      default:
        return null;
    }
  };

  const content = getRoleSpecificContent();
  if (!content) return null;

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-default mb-1">{content.title}</h2>
          <p className="text-sm text-secondary">{content.subtitle}</p>
          {projects.length === 0 && (
            <p className="text-xs text-muted mt-1">No projects yet. Start by creating your first one.</p>
          )}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-secondary hover:text-default hover:underline"
          >
            View All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {content.stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-4 bg-pale rounded-lg border border-custom"
          >
            <div className="flex-shrink-0">{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-default">{stat.value}</p>
              <p className="text-xs text-secondary">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects Preview */}
      <div className="mt-4 pt-4 border-t border-custom">
        <p className="text-sm font-semibold text-secondary mb-2">Recent Active Projects</p>
        {activeProjects.length > 0 ? (
          <div className="space-y-2">
            {activeProjects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/${userRole}/projects/${project.id}`)}
                className="flex items-center justify-between p-2 hover-bg-pale rounded cursor-pointer transition-colors"
              >
                <span className="text-sm text-secondary truncate flex-1">{project.title}</span>
                <span className="text-xs text-muted ml-2">
                  {project.status === "in-progress" ? "Active" : project.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-custom p-4 text-sm text-muted text-center">
            No active projects yet. They'll appear here once work kicks off.
          </div>
        )}
      </div>
    </Card>
  );
};

export default CurrentProjectsCard;

