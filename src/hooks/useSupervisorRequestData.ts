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
import { supervisorRepository } from "@/src/repositories/supervisorRepository";
import { userRepository } from "@/src/repositories/userRepository";

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

        // Load all data in parallel
        const [allProjects, allUsers, userRequests] = await Promise.all([
          projectService.getAllProjects(),
          userRepository.getAll(),
          supervisorRepository.getRequests(undefined, undefined, userId),
        ]);

        // Filter projects to only those where student is assigned
        const eligibleProjects = allProjects.filter((p) =>
          assignedProjectIds.has(p.id.toString())
        );

        setProjects(eligibleProjects);

        // Filter supervisors
        const supervisorUsers = allUsers.filter((u) => u.role === "supervisor");
        setSupervisors(supervisorUsers);

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




