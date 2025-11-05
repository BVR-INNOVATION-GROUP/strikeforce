/**
 * Custom hook for student offers logic
 */
import { useState, useEffect } from "react";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { projectService } from "@/src/services/projectService";
import { useToast } from "@/src/hooks/useToast";

export interface UseStudentOffersResult {
  applications: ApplicationI[];
  projects: Record<string, ProjectI>;
  loading: boolean;
  acceptingId: string | null;
  decliningId: string | null;
  showAcceptConfirm: boolean;
  showDeclineConfirm: boolean;
  selectedApplication: ApplicationI | null;
  activeOffers: ApplicationI[];
  expiredOffers: ApplicationI[];
  setShowAcceptConfirm: (show: boolean) => void;
  setShowDeclineConfirm: (show: boolean) => void;
  setSelectedApplication: (app: ApplicationI | null) => void;
  handleAcceptOffer: (application: ApplicationI) => void;
  handleDeclineOffer: (application: ApplicationI) => void;
  confirmAcceptOffer: () => Promise<void>;
  confirmDeclineOffer: () => Promise<void>;
}

/**
 * Hook for managing student offers state and logic
 */
export function useStudentOffers(userId: string | undefined): UseStudentOffersResult {
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [projects, setProjects] = useState<Record<string, ProjectI>>({});
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationI | null>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [applicationsData, projectsData] = await Promise.all([
          import("@/src/data/mockApplications.json"),
          projectService.getAllProjects(),
        ]);

        const userApplications = (applicationsData.default as ApplicationI[]).filter(
          (app) => userId && app.studentIds.includes(userId) && app.status === "OFFERED"
        );

        setApplications(userApplications);

        const projectsMap: Record<string, ProjectI> = {};
        projectsData.forEach((p) => {
          projectsMap[p.id] = p;
        });
        setProjects(projectsMap);
      } catch (error) {
        console.error("Failed to load offers:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  const handleAcceptOffer = (application: ApplicationI) => {
    setSelectedApplication(application);
    setShowAcceptConfirm(true);
  };

  const handleDeclineOffer = (application: ApplicationI) => {
    setSelectedApplication(application);
    setShowDeclineConfirm(true);
  };

  const confirmAcceptOffer = async () => {
    if (!selectedApplication) return;

    setAcceptingId(selectedApplication.id);
    try {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id
            ? { ...app, status: "ACCEPTED" as ApplicationI["status"] }
            : app
        )
      );

      showSuccess("Offer accepted! You have been assigned to this project.");
      setShowAcceptConfirm(false);
      setSelectedApplication(null);
    } catch (error: any) {
      console.error("Failed to accept offer:", error);
      showError(error.message || "Failed to accept offer. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  const confirmDeclineOffer = async () => {
    if (!selectedApplication) return;

    setDecliningId(selectedApplication.id);
    try {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id
            ? { ...app, status: "DECLINED" as ApplicationI["status"] }
            : app
        )
      );

      showSuccess("Offer declined.");
      setShowDeclineConfirm(false);
      setSelectedApplication(null);
    } catch (error: any) {
      console.error("Failed to decline offer:", error);
      showError(error.message || "Failed to decline offer. Please try again.");
    } finally {
      setDecliningId(null);
    }
  };

  const activeOffers = applications.filter(
    (a) => a.status === "OFFERED" && (!a.offerExpiresAt || new Date(a.offerExpiresAt) >= new Date())
  );
  const expiredOffers = applications.filter(
    (a) => a.offerExpiresAt && new Date(a.offerExpiresAt) < new Date()
  );

  return {
    applications,
    projects,
    loading,
    acceptingId,
    decliningId,
    showAcceptConfirm,
    showDeclineConfirm,
    selectedApplication,
    activeOffers,
    expiredOffers,
    setShowAcceptConfirm,
    setShowDeclineConfirm,
    setSelectedApplication,
    handleAcceptOffer,
    handleDeclineOffer,
    confirmAcceptOffer,
    confirmDeclineOffer,
  };
}





