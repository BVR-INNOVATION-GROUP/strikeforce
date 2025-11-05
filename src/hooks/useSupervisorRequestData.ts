/**
 * Custom hook for supervisor request data loading
 * Filters projects to only show those where student/group is assigned
 */
import { useState, useEffect } from "react";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import { projectService } from "@/src/services/projectService";
import { applicationService } from "@/src/services/applicationService";

export interface UseSupervisorRequestDataResult {
  projects: ProjectI[];
  supervisors: UserI[];
  requests: SupervisorRequestI[];
  loading: boolean;
}

/**
 * Hook for loading supervisor request page data
 */
export function useSupervisorRequestData(
  userId: string | undefined
): UseSupervisorRequestDataResult {
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [supervisors, setSupervisors] = useState<UserI[]>([]);
  const [requests, setRequests] = useState<SupervisorRequestI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const [allProjects, supervisorsData, requestsData] = await Promise.all([
          projectService.getAllProjects(),
          import("@/src/data/mockUsers.json"),
          import("@/src/data/mockSupervisorRequests.json"),
        ]);

        // Get user's applications to filter assigned projects
        // PRD: Students can only request supervisors for projects they're assigned to
        let userApplications;
        try {
          userApplications = await applicationService.getUserApplications(userId);
        } catch (error) {
          console.error("Failed to load user applications:", error);
          userApplications = [];
        }

        // Filter projects to only those where student is assigned (ASSIGNED or ACCEPTED status)
        const assignedProjectIds = new Set(
          userApplications
            .filter((app) => app.status === "ASSIGNED" || app.status === "ACCEPTED")
            .map((app) => app.projectId.toString())
        );

        const eligibleProjects = allProjects.filter((p) =>
          assignedProjectIds.has(p.id.toString())
        );

        setProjects(eligibleProjects);

        const allUsers = supervisorsData.default as UserI[];
        const supervisorUsers = allUsers.filter((u) => u.role === "supervisor");
        setSupervisors(supervisorUsers);

        const userRequests = (requestsData.default as SupervisorRequestI[]).filter(
          (r) => r.studentOrGroupId === userId || r.studentOrGroupId === "group-1"
        );
        setRequests(userRequests);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  return {
    projects,
    supervisors,
    requests,
    loading,
  };
}




