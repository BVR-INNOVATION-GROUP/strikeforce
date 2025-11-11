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
export function useUniversityAdminOffers(universityId: string | number | null): UseUniversityAdminOffersResult {
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
      setLoading(true);

      if (!universityId) {
        setApplications([]);
        setProjects({});
        setLoading(false);
        return;
      }

      try {
        const [{ applicationRepository }] = await Promise.all([
          import("@/src/repositories/applicationRepository"),
        ]);

        const [allApplications, allProjects] = await Promise.all([
          applicationRepository.getAll(),
          projectService.getAllProjects(),
        ]);

        const numericUniversityId =
          typeof universityId === "string" ? parseInt(universityId, 10) : universityId;

        const universityProjects = allProjects.filter((project) => {
          const projectUniversityId =
            typeof project.universityId === "string"
              ? parseInt(project.universityId, 10)
              : project.universityId;
          return projectUniversityId === numericUniversityId;
        });

        const projectIds = new Set(universityProjects.map((project) => project.id.toString()));

        const filteredApplications = allApplications.filter((application) =>
          projectIds.has(application.projectId.toString())
        );

        const projectsMap: Record<string, ProjectI> = {};
        universityProjects.forEach((project) => {
          projectsMap[project.id.toString()] = project;
        });

        setApplications(filteredApplications);
        setProjects(projectsMap);
      } catch (error) {
        console.error("Failed to load applications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [universityId]);

  const handleIssueOffer = (application: ApplicationI) => {
    setSelectedApplication(application);
    setIsOfferModalOpen(true);
    const defaultExpiry = application.offerExpiresAt
      ? application.offerExpiresAt.split("T")[0]
      : (() => {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 7);
          return expiryDate.toISOString().split("T")[0];
        })();
    setOfferExpiry(defaultExpiry);
    setErrors({});
  };

  const handleSendOffer = async () => {
    if (!selectedApplication) return;

    try {
      const validationErrors = validateOfferExpiry(offerExpiry);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        showError("Please fix the errors before sending the offer");
        return;
      }

      const [{ applicationRepository }] = await Promise.all([
        import("@/src/repositories/applicationRepository"),
      ]);

      const numericAppId =
        typeof selectedApplication.id === "string"
          ? parseInt(selectedApplication.id, 10)
          : selectedApplication.id;

      const offerExpiresAt = new Date(offerExpiry).toISOString();
      const updatedApplication = await applicationRepository.update(numericAppId, {
        status: "OFFERED",
        offerExpiresAt,
        updatedAt: new Date().toISOString(),
      });

      setApplications((apps) =>
        apps.map((app) => (app.id === updatedApplication.id ? updatedApplication : app))
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






