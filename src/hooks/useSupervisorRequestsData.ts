/**
 * Custom hook for supervisor requests data
 */
import { useState, useEffect } from "react";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import { projectService } from "@/src/services/projectService";
import { supervisorService } from "@/src/services/supervisorService";
import { userRepository } from "@/src/repositories/userRepository";

export interface UseSupervisorRequestsDataResult {
  requests: SupervisorRequestI[];
  projects: Record<string, ProjectI>;
  students: Record<string, UserI>;
  loading: boolean;
}

/**
 * Hook for loading supervisor requests data
 */
export function useSupervisorRequestsData(
  supervisorId: string | null
): UseSupervisorRequestsDataResult {
  const [requests, setRequests] = useState<SupervisorRequestI[]>([]);
  const [projects, setProjects] = useState<Record<string, ProjectI>>({});
  const [students, setStudents] = useState<Record<string, UserI>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!supervisorId) {
        setLoading(false);
        return;
      }

      try {
        const [requestsData, projectsData, usersData] = await Promise.all([
          supervisorService.getRequests(supervisorId),
          projectService.getAllProjects(),
          userRepository.getAll(),
        ]);

        setRequests(requestsData);

        const projectsMap: Record<string, ProjectI> = {};
        projectsData.forEach((p) => {
          projectsMap[p.id] = p;
        });
        setProjects(projectsMap);

        const usersMap: Record<string, UserI> = {};
        usersData.forEach((u) => {
          usersMap[u.id] = u;
        });
        setStudents(usersMap);
      } catch (error) {
        console.error("Failed to load requests:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [supervisorId]);

  return { requests, projects, students, loading };
}









