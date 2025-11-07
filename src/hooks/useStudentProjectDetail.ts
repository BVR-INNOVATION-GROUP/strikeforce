/**
 * Custom hook for student project detail page logic
 */
import { useState, useEffect } from "react";
import { ProjectI } from "@/src/models/project";
import { GroupI } from "@/src/models/group";
import { ApplicationI } from "@/src/models/application";
import { projectService } from "@/src/services/projectService";
import { applicationService } from "@/src/services/applicationService";
import { useToast } from "@/src/hooks/useToast";

export interface UseStudentProjectDetailResult {
  project: ProjectI | null;
  groups: GroupI[];
  hasApplied: boolean;
  existingApplication: ApplicationI | null;
  loading: boolean;
  handleApplicationSubmit: (applicationData: Partial<ApplicationI>) => Promise<void>;
}

/**
 * Hook for managing student project detail state and logic
 */
export function useStudentProjectDetail(
  projectId: string,
  userId: string | undefined
): UseStudentProjectDetailResult {
  const [project, setProject] = useState<ProjectI | null>(null);
  const [groups, setGroups] = useState<GroupI[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState<ApplicationI | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return;

      try {
        const projectData = await projectService.getProjectById(projectId);
        setProject(projectData);

        const groupsData = await import("@/src/data/mockGroups.json");
        const allGroups = groupsData.default as GroupI[];
        const userGroups = allGroups.filter(
          (g) => g.leaderId === userId || g.memberIds.includes(userId || "")
        );
        setGroups(userGroups);

        if (userId) {
          const applied = await applicationService.hasApplied(projectId, userId);
          setHasApplied(applied);

          if (applied) {
            const userApplications = await applicationService.getUserApplications(userId);
            const existingApp = userApplications.find((app) => app.projectId === projectId);
            setExistingApplication(existingApp || null);
          }
        }
      } catch (error) {
        console.error("Failed to load project:", error);
        showError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, userId, showError]);

  const handleApplicationSubmit = async (applicationData: Partial<ApplicationI>) => {
    try {
      await applicationService.submitApplication(applicationData);
      showSuccess("Application submitted successfully!");
      setHasApplied(true);
      if (userId) {
        const userApplications = await applicationService.getUserApplications(userId);
        const existingApp = userApplications.find((app) => app.projectId === projectId);
        setExistingApplication(existingApp || null);
      }
    } catch (error) {
      console.error("Failed to submit application:", error);
      throw error;
    }
  };

  return {
    project,
    groups,
    hasApplied,
    existingApplication,
    loading,
    handleApplicationSubmit,
  };
}






