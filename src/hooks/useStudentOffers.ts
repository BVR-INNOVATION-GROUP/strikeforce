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
export function useStudentOffers(
  userId: string | undefined
): UseStudentOffersResult {
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [projects, setProjects] = useState<Record<string, ProjectI>>({});
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationI | null>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { applicationService } = await import("@/src/services/applicationService");
        const [userApplications, projectsData] = await Promise.all([
          applicationService.getUserApplications(),
          projectService.getAllProjects(),
        ]);

        // Filter for OFFERED status
        const offeredApplications = userApplications.filter(
          (app) => app.status === "OFFERED"
        );

        setApplications(offeredApplications);

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

    // Validate offer is not expired
    if (selectedApplication.offerExpiresAt) {
      const expiryDate = new Date(selectedApplication.offerExpiresAt);
      if (expiryDate < new Date()) {
        showError("This offer has expired and can no longer be accepted.");
        setShowAcceptConfirm(false);
        setSelectedApplication(null);
        return;
      }
    }

    // Validate offer is still in OFFERED status
    if (selectedApplication.status !== "OFFERED") {
      showError("This offer is no longer available.");
      setShowAcceptConfirm(false);
      setSelectedApplication(null);
      return;
    }

    setAcceptingId(selectedApplication.id.toString());
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      
      // Call backend API to accept the offer
      const numericAppId = typeof selectedApplication.id === "string" 
        ? parseInt(selectedApplication.id, 10) 
        : selectedApplication.id;
      
      const updatedApplication = await applicationRepository.acceptOffer(numericAppId);

      // Remove the accepted offer from the list (it's now ASSIGNED, not OFFERED)
      setApplications((prev) =>
        prev.filter((app) => app.id !== selectedApplication.id)
      );

      showSuccess("Offer accepted! You have been assigned to this project.");
      setShowAcceptConfirm(false);
      setSelectedApplication(null);
      
      // Reload data to get updated list
      const { applicationService } = await import("@/src/services/applicationService");
      const userApplications = await applicationService.getUserApplications();
      const offeredApplications = userApplications.filter(
        (app) => app.status === "OFFERED"
      );
      setApplications(offeredApplications);
    } catch (error: any) {
      console.error("Failed to accept offer:", error);
      const errorMessage = error?.response?.data?.msg || error?.message || "Failed to accept offer. Please try again.";
      showError(errorMessage);
    } finally {
      setAcceptingId(null);
    }
  };

  const confirmDeclineOffer = async () => {
    if (!selectedApplication) return;

    // Validate offer is still in OFFERED status
    if (selectedApplication.status !== "OFFERED") {
      showError("This offer is no longer available.");
      setShowDeclineConfirm(false);
      setSelectedApplication(null);
      return;
    }

    setDecliningId(selectedApplication.id.toString());
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      
      // Call backend API to decline the offer
      const numericAppId = typeof selectedApplication.id === "string" 
        ? parseInt(selectedApplication.id, 10) 
        : selectedApplication.id;
      
      const updatedApplication = await applicationRepository.declineOffer(numericAppId);

      // Remove the declined offer from the list (it's now DECLINED, not OFFERED)
      setApplications((prev) =>
        prev.filter((app) => app.id !== selectedApplication.id)
      );

      showSuccess("Offer declined.");
      setShowDeclineConfirm(false);
      setSelectedApplication(null);
      
      // Reload data to get updated list
      const { applicationService } = await import("@/src/services/applicationService");
      const userApplications = await applicationService.getUserApplications();
      const offeredApplications = userApplications.filter(
        (app) => app.status === "OFFERED"
      );
      setApplications(offeredApplications);
    } catch (error: any) {
      console.error("Failed to decline offer:", error);
      const errorMessage = error?.response?.data?.msg || error?.message || "Failed to decline offer. Please try again.";
      showError(errorMessage);
    } finally {
      setDecliningId(null);
    }
  };

  const activeOffers = applications.filter(
    (a) =>
      a.status === "OFFERED" &&
      (!a.offerExpiresAt || new Date(a.offerExpiresAt) >= new Date())
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
