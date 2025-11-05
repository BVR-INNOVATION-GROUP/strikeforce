/**
 * Custom hook for university admin offers logic
 */
import { useState, useEffect } from "react";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { projectService } from "@/src/services/projectService";
import { validateOfferExpiry, ValidationErrors } from "@/src/utils/offerValidation";
import { useToast } from "@/src/hooks/useToast";

export interface UseUniversityAdminOffersResult {
  applications: ApplicationI[];
  projects: Record<string, ProjectI>;
  selectedApplication: ApplicationI | null;
  isOfferModalOpen: boolean;
  offerExpiry: string;
  loading: boolean;
  errors: ValidationErrors;
  setSelectedApplication: (app: ApplicationI | null) => void;
  setIsOfferModalOpen: (open: boolean) => void;
  setOfferExpiry: (expiry: string) => void;
  handleIssueOffer: (application: ApplicationI) => void;
  handleSendOffer: () => Promise<void>;
  resetForm: () => void;
}

/**
 * Hook for managing university admin offers state and logic
 */
export function useUniversityAdminOffers(): UseUniversityAdminOffersResult {
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [projects, setProjects] = useState<Record<string, ProjectI>>({});
  const [selectedApplication, setSelectedApplication] = useState<ApplicationI | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerExpiry, setOfferExpiry] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [applicationsData, projectsData] = await Promise.all([
          import("@/src/data/mockApplications.json"),
          projectService.getAllProjects(),
        ]);

        setApplications(applicationsData.default as ApplicationI[]);

        const projectsMap: Record<string, ProjectI> = {};
        projectsData.forEach((p) => {
          projectsMap[p.id] = p;
        });
        setProjects(projectsMap);
      } catch (error) {
        console.error("Failed to load applications:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleIssueOffer = (application: ApplicationI) => {
    setSelectedApplication(application);
    setIsOfferModalOpen(true);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    setOfferExpiry(expiryDate.toISOString().split("T")[0]);
  };

  const handleSendOffer = async () => {
    if (!selectedApplication) return;

    const validationErrors = validateOfferExpiry(offerExpiry);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      showError("Please fix the errors before sending the offer");
      return;
    }

    try {
      setApplications(
        applications.map((app) =>
          app.id === selectedApplication.id
            ? {
                ...app,
                status: "OFFERED",
                offerExpiresAt: new Date(offerExpiry).toISOString(),
              }
            : app
        )
      );
      showSuccess("Offer sent successfully! The applicant will be notified.");
      resetForm();
    } catch (error) {
      console.error("Failed to send offer:", error);
      showError("Failed to send offer. Please try again.");
    }
  };

  const resetForm = () => {
    setIsOfferModalOpen(false);
    setSelectedApplication(null);
    setOfferExpiry("");
    setErrors({});
  };

  return {
    applications,
    projects,
    selectedApplication,
    isOfferModalOpen,
    offerExpiry,
    loading,
    errors,
    setSelectedApplication,
    setIsOfferModalOpen,
    setOfferExpiry,
    handleIssueOffer,
    handleSendOffer,
    resetForm,
  };
}





