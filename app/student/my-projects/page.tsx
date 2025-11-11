"use client";

import React, { useEffect, useState } from "react";
import Project, { ProjectI, projectStatus } from "@/src/components/screen/partner/projects/Project";
import { ProjectI as ModelProjectI } from "@/src/models/project";
import { ApplicationI } from "@/src/models/application";
import { projectService } from "@/src/services/projectService";
import { applicationService } from "@/src/services/applicationService";
import { useAuthStore } from "@/src/store";
import IconButton from "@/src/components/core/IconButton";
import Card from "@/src/components/core/Card";
import { currenciesArray } from "@/src/constants/currencies";
import { formatDateShort } from "@/src/utils/dateFormatters";
import { transformApplications } from "@/src/utils/projectTransformers";

/**
 * Student My Projects Page - Tabbed view of assigned/applied projects
 * Shows projects in tabs: Applied, In Progress, Completed
 * Each tab displays projects in a card grid layout
 * No dragging functionality (students cannot move projects)
 */
export default function StudentMyProjects() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"applied" | "in-progress" | "completed">("applied");

  /**
   * Load student's projects and applications
   */
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get all projects and user's applications
        const [allProjects, userApplications] = await Promise.all([
          projectService.getAllProjects(),
          applicationService.getUserApplications(user.id.toString()),
        ]);

        // Load groups and users data for member information
        const [groupsModule, usersModule] = await Promise.all([
          import("@/src/data/mockGroups.json"),
          import("@/src/data/mockUsers.json"),
        ]);
        const groupsData = groupsModule.default;
        const usersData = usersModule.default;

        setApplications(userApplications);

        // Get project IDs that student has applied to
        const projectIds = new Set(
          userApplications.map((app) => app.projectId.toString())
        );

        // Filter projects that student has applied to
        const relevantProjects = allProjects.filter((p) =>
          projectIds.has(p.id.toString())
        );

        // Transform applications to get member data
        const transformedApps = transformApplications(
          userApplications,
          groupsData,
          usersData
        );

        // Create a map of application ID to transformed app for quick lookup
        const appIdToTransformedMap = new Map<number, typeof transformedApps[0]>();
        userApplications.forEach((app, index) => {
          appIdToTransformedMap.set(app.id, transformedApps[index]);
        });

        // Convert to UI format
        const uiProjects: ProjectI[] = relevantProjects.map((project) => {
          const projectApplications = userApplications.filter(
            (app) => app.projectId.toString() === project.id.toString()
          );

          // Format currency
          const currencyInfo = currenciesArray.find(
            (c) => c.code === project.currency
          );
          const currencySymbol = currencyInfo?.symbol || project.currency;
          const formattedCost = `${currencySymbol}${project.budget.toLocaleString()}`;
          const formattedDeadline = formatDateShort(project.deadline);

          // Find assigned application to get group and member data
          const assignedApplication = projectApplications.find(
            (app) => app.status === "ASSIGNED" || app.status === "ACCEPTED"
          );
          const assignedTransformedApp = assignedApplication
            ? appIdToTransformedMap.get(assignedApplication.id)
            : undefined;

          // Get group information from assigned application
          let groupName = "Not Assigned";
          let groupMembers: Array<{ name: string; avatar: string }> = [];

          if (assignedTransformedApp) {
            groupName = assignedTransformedApp.groupName;
            groupMembers = assignedTransformedApp.members || [];
          } else {
            // Try to find unknown application for this project to show group info
            const firstApp = projectApplications[0];
            if (firstApp) {
              const projectTransformedApp = appIdToTransformedMap.get(firstApp.id);
              if (projectTransformedApp) {
                groupName = projectTransformedApp.groupName;
                groupMembers = projectTransformedApp.members || [];
              }
            }
          }

          // Determine status based on application status
          let cardStatus: projectStatus = "in-progress";
          const completedApp = projectApplications.find(
            (app) => project.status === "completed"
          );

          if (completedApp || project.status === "completed") {
            cardStatus = "completed";
          } else if (assignedApplication) {
            cardStatus = "in-progress";
          } else {
            // Applied but not assigned - show in applied
            cardStatus = "in-progress";
          }

          return {
            id: project.id,
            title: project.title,
            description: project.description,
            skills: project.skills,
            status: cardStatus,
            group: {
              name: groupName,
              members: groupMembers,
            },
            expiryDate: formattedDeadline,
            cost: formattedCost,
            // Disable dragging by not providing onMove
            onMove: undefined,
          } as ProjectI;
        });

        setProjects(uiProjects);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        Loading...
      </div>
    );
  }

  /**
   * Categorize projects by status for tabs
   */
  const appliedProjects = projects.filter((p) => {
    const app = applications.find(
      (a) => a.projectId.toString() === p.id.toString()
    );
    return (
      app &&
      app.status !== "ASSIGNED" &&
      app.status !== "ACCEPTED" &&
      p.status !== "completed"
    );
  });

  const inProgressProjects = projects.filter((p) => {
    const app = applications.find(
      (a) => a.projectId.toString() === p.id.toString()
    );
    return (
      app &&
      (app.status === "ASSIGNED" || app.status === "ACCEPTED") &&
      p.status !== "completed"
    );
  });

  const completedProjects = projects.filter((p) => p.status === "completed");

  /**
   * Get projects for active tab
   */
  const getActiveTabProjects = () => {
    switch (activeTab) {
      case "applied":
        return appliedProjects;
      case "in-progress":
        return inProgressProjects;
      case "completed":
        return completedProjects;
      default:
        return [];
    }
  };

  const activeTabProjects = getActiveTabProjects();

  /**
   * Get tab counts for display
   */
  const tabCounts = {
    applied: appliedProjects.length,
    "in-progress": inProgressProjects.length,
    completed: completedProjects.length,
  };

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-[1rem] font-[600]">My Projects</h1>
          <IconButton
            icon={<span>{projects.length}</span>}
            className="bg-pale-primary"
            disableShrink
          />
        </div>
        <p className="text-[0.875rem] opacity-60">
          View and manage your project applications and assignments
        </p>
      </div>

      {/* Tabs */}
      <Card className="mb-8">
        <div className="flex gap-4 border-b border-custom mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("applied")}
            className={`pb-2 px-4 whitespace-nowrap ${activeTab === "applied"
              ? "border-b-2 border-primary text-primary font-[600]"
              : "text-[0.875rem] opacity-60"
              }`}
          >
            Applied ({tabCounts.applied})
          </button>
          <button
            onClick={() => setActiveTab("in-progress")}
            className={`pb-2 px-4 whitespace-nowrap ${activeTab === "in-progress"
              ? "border-b-2 border-primary text-primary font-[600]"
              : "text-[0.875rem] opacity-60"
              }`}
          >
            In Progress ({tabCounts["in-progress"]})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-2 px-4 whitespace-nowrap ${activeTab === "completed"
              ? "border-b-2 border-primary text-primary font-[600]"
              : "text-[0.875rem] opacity-60"
              }`}
          >
            Completed ({tabCounts.completed})
          </button>
        </div>

        {/* Projects Grid */}
        {activeTabProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[0.875rem] opacity-60">
              No projects in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTabProjects.map((project) => (
              <Project key={project.id} {...(project as ProjectI & { index?: number })} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

