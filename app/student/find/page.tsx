"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import { projectService } from "@/src/services/projectService";
import { applicationService } from "@/src/services/applicationService";
import { ProjectI } from "@/src/models/project";
import { ApplicationI } from "@/src/models/application";
import Input from "@/src/components/core/Input";
import Select from "@/src/components/core/Select";
import Checkbox from "@/src/components/core/Checkbox";
import ApplicationForm from "@/src/components/screen/student/ApplicationForm";
import SideModal from "@/src/components/base/SideModal";
import { Search, Filter, X, Clock, CheckCircle2, Bookmark, Share2, Eye, Send, Users, Building2, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/src/store";
import { useThemeStore } from "@/src/store/useThemeStore";
import { useToast } from "@/src/hooks/useToast";
import { currenciesArray } from "@/src/constants/currencies";
import { GroupI } from "@/src/models/group";
import { stripHtmlTags } from "@/src/utils/htmlUtils";
import { formatCompactCurrency } from "@/src/utils/numberFormat";
import { BASE_URL } from "@/src/api/client";
import DashboardLoading from "@/src/components/core/DashboardLoading";

const TOP_BANNER_IMAGES = [
  "https://images.pexels.com/photos/11674625/pexels-photo-11674625.jpeg",
  "https://images.pexels.com/photos/7828353/pexels-photo-7828353.jpeg",
  "https://images.pexels.com/photos/1954/black-and-white-lights-abstract-curves.jpg",
  "https://images.pexels.com/photos/28947852/pexels-photo-28947852.jpeg",
  "https://images.pexels.com/photos/13551577/pexels-photo-13551577.jpeg",
  "https://images.pexels.com/photos/29506610/pexels-photo-29506610.jpeg",
];

/**
 * Student Find Projects - Upwork-style layout with Google-like search
 * PRD Reference: Section 6 - Groups and Applications
 * Layout: Projects on left (scrollable), Filters on right (scrollable, sticky)
 */
export default function StudentProjects() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { showSuccess, showError } = useToast();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectI[]>([]);
  const [userApplications, setUserApplications] = useState<ApplicationI[]>([]);
  const [organizations, setOrganizations] = useState<Record<string, string>>({});
  const [organizationLogos, setOrganizationLogos] = useState<Record<string, string>>({});
  const [organizationColors, setOrganizationColors] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<GroupI[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Projects per page

  // Saved projects in local storage
  const [savedProjects, setSavedProjects] = useState<Set<string>>(new Set());

  // Load saved projects from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savedProjects");
      if (saved) {
        try {
          const savedArray = JSON.parse(saved) as string[];
          setSavedProjects(new Set(savedArray));
        } catch (error) {
          console.error("Failed to load saved projects:", error);
        }
      }
    }
  }, []);

  // Save project to local storage
  const saveProjectToStorage = (projectId: string | number) => {
    const id = projectId.toString();
    const newSaved = new Set(savedProjects);
    newSaved.add(id);
    setSavedProjects(newSaved);
    if (typeof window !== "undefined") {
      localStorage.setItem("savedProjects", JSON.stringify(Array.from(newSaved)));
    }
  };

  // Remove project from local storage
  const removeProjectFromStorage = (projectId: string | number) => {
    const id = projectId.toString();
    const newSaved = new Set(savedProjects);
    newSaved.delete(id);
    setSavedProjects(newSaved);
    if (typeof window !== "undefined") {
      localStorage.setItem("savedProjects", JSON.stringify(Array.from(newSaved)));
    }
  };

  // Filter states
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [sortBy] = useState<string>("newest"); // Always sorted by newest, no UI control
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [minBudgetDisplay, setMinBudgetDisplay] = useState("");
  const [maxBudgetDisplay, setMaxBudgetDisplay] = useState("");

  // Application form state
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);

  // Get all unique skills from projects
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    projects.forEach((p) => {
      p.skills.forEach((skill) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  }, [projects]);

  // Calculate budget bounds from projects
  const budgetBounds = useMemo(() => {
    if (projects.length === 0) return { min: 0, max: 200000 };
    const budgets = projects.map((p) => p.budget);
    return { min: Math.min(...budgets), max: Math.max(...budgets) };
  }, [projects]);

  // Format number with commas
  const formatWithCommas = (value: string): string => {
    if (!value || value === "") return "";
    const cleaned = value.replace(/,/g, "");
    if (!/^\d+$/.test(cleaned)) return value;
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Parse formatted value (remove commas)
  const parseFormattedValue = (value: string): string => {
    if (!value || value === "") return "";
    return value.replace(/,/g, "");
  };

  // Load organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgsData = await import("@/src/data/mockOrganizations.json");
        const orgs = orgsData.default as Array<{ id: number | string; name: string }>;
        const orgMap: Record<string, string> = {};
        orgs.forEach((org) => {
          orgMap[org.id.toString()] = org.name;
        });
        setOrganizations(orgMap);
      } catch (error) {
        console.error("Failed to load organizations:", error);
      }
    };
    loadOrganizations();
  }, []);

  // Check if user has applied to a project
  // Exclude DECLINED applications (withdrawn applications) - students can re-apply after withdrawal
  const getApplicationStatus = (projectId: string | number | undefined): ApplicationI | null => {
    if (!projectId) return null;
    return userApplications.find(
      (app) =>
        app.projectId &&
        app.projectId.toString() === projectId.toString() &&
        app.status !== "DECLINED" // Exclude withdrawn applications
    ) || null;
  };

  // Get currency symbol from project
  const getCurrencySymbol = (currency: string): string => {
    const currencyInfo = currenciesArray.find((c) => c.code === currency);
    return currencyInfo?.symbol || currency;
  };

  // Get organization name from project
  const getOrganizationName = (partnerId: string): string => {
    // First try to get from organizations map
    // If partnerId is a user ID, we need to get orgId from user
    // For now, return from organizations if available
    return organizations[partnerId] || "Company";
  };

  // Get organization logo from project
  const getOrganizationLogo = (partnerId: string): string | null => {
    return organizationLogos[partnerId] || null;
  };

  // Get organization brand color from project
  const getOrganizationColor = (partnerId: string): string | null => {
    return organizationColors[partnerId] || null;
  };

  // Get team structure label
  const getTeamStructureLabel = (structure?: string): string => {
    switch (structure) {
      case "individuals": return "Individuals Only";
      case "groups": return "Groups Only";
      case "both": return "Individuals or Groups";
      default: return "";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects with pagination, applications, and groups
        // Only fetch published projects for discoverability
        const [projectsResult, applicationsData, usersData] = await Promise.all([
          projectService.getAllProjects({ page: currentPage, limit: pageSize, status: "published" }),
          applicationService.getUserApplications(),
          import("@/src/data/mockUsers.json"),
        ]);

        // Filter to only published projects as a safety measure
        const publishedProjects = projectsResult.projects.filter(p => p.status === "published");
        setProjects(publishedProjects);
        // Recalculate pagination based on published projects only
        const totalPublished = publishedProjects.length;
        const calculatedTotalPages = Math.ceil(totalPublished / pageSize);
        setTotalPages(calculatedTotalPages);
        setTotalProjects(totalPublished);
        setUserApplications(applicationsData);

        // Load groups from backend API for application form
        try {
          const { groupService } = await import("@/src/services/groupService");
          const userGroups = await groupService.getUserGroups();
          setGroups(userGroups);
        } catch (groupError) {
          console.error("Failed to load groups:", groupError);
          // Fallback to empty array if groups fail to load
          setGroups([]);
        }

        // Build organization map and logo map from users
        const users = usersData.default as Array<{ id: number | string; orgId?: number | string; name: string }>;
        const orgsData = await import("@/src/data/mockOrganizations.json");
        const orgs = orgsData.default as Array<{ id: number | string; name: string; logo?: string }>;

        const orgMap: Record<string, string> = {};
        const logoMap: Record<string, string> = {};
        const colorMap: Record<string, string> = {};
        projectsResult.projects.forEach((project) => {
          const user = users.find((u) => u.id.toString() === project.partnerId.toString());
          if (user?.orgId) {
            const org = orgs.find((o) => o.id.toString() === user.orgId?.toString());
            if (org) {
              const key = project.partnerId.toString();
              orgMap[key] = org.name;
              if (org.logo) {
                logoMap[key] = org.logo;
              }
              if ((org as any).brandColor) {
                colorMap[key] = (org as any).brandColor as string;
              }
            }
          }
          // Also check if project has user data with organization
          if ((project as any).user?.orgId) {
            const org = orgs.find((o) => o.id.toString() === (project as any).user.orgId?.toString());
            if (org) {
              const key = project.partnerId.toString();
              orgMap[key] = org.name;
              if (org.logo) {
                logoMap[key] = org.logo;
              }
              if ((org as any).brandColor) {
                colorMap[key] = (org as any).brandColor as string;
              }
            }
          }
        });
        setOrganizations(orgMap);
        setOrganizationLogos(logoMap);
        setOrganizationColors(colorMap);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id, currentPage, pageSize]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...projects];

    // Only show published projects (safety filter)
    filtered = filtered.filter((p) => p.status === "published");

    // Search filter - Google-like (searches title, description, skills)
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.skills.some((skill) => skill.toLowerCase().includes(searchLower))
      );
    }

    // Skills filter
    if (selectedSkills.size > 0) {
      filtered = filtered.filter((p) =>
        p.skills.some((skill) => selectedSkills.has(skill))
      );
    }

    // Budget filter
    if (minBudget) {
      const min = parseFloat(parseFormattedValue(minBudget));
      if (!isNaN(min)) {
        filtered = filtered.filter((p) => p.budget >= min);
      }
    }
    if (maxBudget) {
      const max = parseFloat(parseFormattedValue(maxBudget));
      if (!isNaN(max)) {
        filtered = filtered.filter((p) => p.budget <= max);
      }
    }

    // Sort (always by newest)
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredProjects(filtered);
  }, [search, projects, selectedSkills, minBudget, maxBudget]);

  // Top projects by price (highest budget first)
  const topPricedProjects = useMemo(() => {
    if (!projects.length) return [];
    const withNumericBudget = projects.map((p) => {
      const raw =
        typeof p.budget === "number"
          ? p.budget
          : (p.budget?.value || p.budget?.Value || 0);
      return { project: p, budgetValue: Number(raw) || 0 };
    });
    return withNumericBudget
      .sort((a, b) => b.budgetValue - a.budgetValue)
      .slice(0, 3)
      .map((item) => item.project);
  }, [projects]);

  const isDark = theme === "dark";
  const topScrollRef = useRef<HTMLDivElement | null>(null);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(skill)) {
        newSet.delete(skill);
      } else {
        newSet.add(skill);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSelectedSkills(new Set());
    setMinBudget("");
    setMaxBudget("");
    setMinBudgetDisplay("");
    setMaxBudgetDisplay("");
  };

  const hasActiveFilters = selectedSkills.size > 0 ||
    (minBudget !== "" && minBudget !== undefined) || (maxBudget !== "" && maxBudget !== undefined);

  const handleSaveProject = (projectId: string | number) => {
    const id = projectId.toString();
    if (savedProjects.has(id)) {
      removeProjectFromStorage(projectId);
      showSuccess("Project removed from saved list");
    } else {
      saveProjectToStorage(projectId);
      showSuccess("Project saved to your list");
    }
  };

  const handleShareProject = (project: ProjectI) => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: `${window.location.origin}/student/projects/${project.id}`,
      }).catch(() => {
        navigator.clipboard.writeText(`${window.location.origin}/student/projects/${project.id}`);
        showSuccess("Link copied to clipboard");
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/student/projects/${project.id}`);
      showSuccess("Link copied to clipboard");
    }
  };

  const handleOpenApplicationForm = (projectId: string | number) => {
    // Verify project exists before opening form
    if (!projectId) {
      showError("Invalid project ID");
      return;
    }
    const project = projects.find((p) => p.id && p.id.toString() === projectId.toString());
    if (!project) {
      showError("Project not found");
      return;
    }
    setSelectedProjectId(projectId.toString());
    setShowApplicationForm(true);
  };

  const handleApplicationSubmit = async (applicationData: Partial<ApplicationI>) => {
    setSubmittingApplication(true);
    try {
      // Verify project exists
      const projectId = applicationData.projectId;
      if (projectId) {
        const project = projects.find((p) => p.id && p.id.toString() === projectId.toString());
        if (!project) {
          showError("Project not found");
          setSubmittingApplication(false);
          return;
        }
      }

      // Submit application via service
      const newApplication = await applicationService.submitApplication(applicationData);

      // Update local state to reflect the new application
      setUserApplications([...userApplications, newApplication]);
      showSuccess("Application submitted successfully!");

      // Close form after successful submission
      setShowApplicationForm(false);
      setSelectedProjectId("");
    } catch (error) {
      console.error("Failed to submit application:", error);
      showError(error instanceof Error ? error.message : "Failed to submit application. Please try again.");
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleNextTopProject = () => {
    setActiveTopIndex((prev) => (topPricedProjects.length ? (prev + 1) % topPricedProjects.length : 0));
  };

  const handlePrevTopProject = () => {
    setActiveTopIndex((prev) =>
      topPricedProjects.length ? (prev - 1 + topPricedProjects.length) % topPricedProjects.length : 0
    );
  };

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="w-full flex flex-col h-full text-sm">
      {/* Google-like Search Bar */}
      <div className="flex-shrink-0 mb-6 flex justify-center">
        <div className="w-full max-w-4xl gap-2 flex items-center justify-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full h-15 pl-8 text-base bg-paper rounded-full outline-none"
          />
          <div className="flex items-center gap-2 h-14">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="bg-primary rounded-full min-w-14 h-14 w-14 flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Layout (single column, scrollable) */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            {/* Today's top pick banner - inside scroll */}
            {showTopBanner && topPricedProjects.length > 0 && (
              <div className="w-full flex justify-center">
                <div className="w-full px-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted font-medium uppercase tracking-wide">
                      Today&apos;s hottest pick
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="hidden md:flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (topScrollRef.current) {
                              topScrollRef.current.scrollBy({ left: -topScrollRef.current.clientWidth, behavior: "smooth" });
                            }
                          }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-paper/80 text-secondary hover:text-primary hover:bg-paper transition-colors border border-custom"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (topScrollRef.current) {
                              topScrollRef.current.scrollBy({ left: topScrollRef.current.clientWidth, behavior: "smooth" });
                            }
                          }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-paper/80 text-secondary hover:text-primary hover:bg-paper transition-colors border border-custom"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTopBanner(false)}
                        className="flex items-center gap-1 text-[0.7rem] text-muted hover:text-secondary transition-colors"
                      >
                        <X size={12} />
                        Hide
                      </button>
                    </div>
                  </div>
                  {topPricedProjects.length > 0 && (
                    <div
                      ref={topScrollRef}
                      className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:px-0 snap-x snap-mandatory"
                    >
                      {topPricedProjects.map((project, idx) => {
                        const currencySymbol = getCurrencySymbol(project.currency);
                        const partnerKey = project.partnerId.toString();
                        const companyName = getOrganizationName(partnerKey);
                        const companyColor = getOrganizationColor(partnerKey) || "var(--primary)";
                        const budgetValue =
                          typeof project.budget === "number"
                            ? project.budget
                            : project.budget?.value || project.budget?.Value || 0;
                        const bannerImage =
                          TOP_BANNER_IMAGES[idx % TOP_BANNER_IMAGES.length];

                        return (
                          <div
                            key={project.id}
                            className="relative overflow-hidden rounded-2xl bg-paper shadow-custom min-w-[80%] sm:min-w-[50%] lg:min-w-[45%] snap-center"
                          >
                            <Link href={`/student/projects/${project.id}`} className="block h-full">
                              {/* Background image */}
                              <div
                                className="relative h-40 sm:h-48 w-full"
                                style={{
                                  backgroundImage: `url(${bannerImage})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              >
                                <div
                                  className={`absolute inset-0 backdrop-blur-sm ${isDark ? "bg-black/70" : "bg-black/40"
                                    }`}
                                />
                                <div
                                  className={`absolute inset-0 mix-blend-soft-light bg-[radial-gradient(circle_at_10%_20%,white_0,transparent_45%),radial-gradient(circle_at_80%_80%,white_0,transparent_40%)] ${isDark ? "opacity-40" : "opacity-60"
                                    }`}
                                />
                                {/* Headline copy */}
                                <div className="relative h-full w-full flex flex-col justify-center px-6 sm:px-8 py-6 text-white">
                                  <h2 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-1">
                                    {project.title}
                                  </h2>
                                  <p className="text-[0.75rem] sm:text-sm max-w-xl opacity-90 line-clamp-2">
                                    From <span className="font-semibold">{companyName}</span> with a budget of{" "}
                                    <span className="font-semibold">
                                      {currencySymbol}
                                      {formatCompactCurrency(budgetValue)}
                                    </span>
                                    . You look like a great match — don&apos;t miss your slot.
                                  </p>
                                </div>
                              </div>

                              {/* Call-to-action bar */}
                              <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-pale to-very-pale">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-pale flex items-center justify-center overflow-hidden border border-custom">
                                    <Building2 size={18} className="text-secondary" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold line-clamp-1">{companyName}</p>
                                    <p className="text-[0.7rem] text-muted line-clamp-1">
                                      {project.skills?.slice(0, 3).join(" • ")}
                                      {project.skills && project.skills.length > 3
                                        ? `  +${project.skills.length - 3} more`
                                        : ""}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="hidden sm:flex flex-col text-right text-[0.7rem] text-muted">
                                    <span>Starting from</span>
                                    <span className="text-sm font-semibold text-primary">
                                      {currencySymbol}
                                      {formatCompactCurrency(budgetValue)}
                                    </span>
                                  </div>
                                  <Button className="bg-primary btn-keep-primary hover:opacity-90 text-white text-sm px-6 py-2 rounded-full whitespace-nowrap">
                                    Apply now
                                  </Button>
                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-secondary">
                Showing {filteredProjects.length} of {totalProjects} {totalProjects === 1 ? "project" : "projects"}
              </p>
            </div>

            {/* Projects List */}
            {filteredProjects.map((project, index) => {
              const application = getApplicationStatus(project.id);
              const hasApplied = !!application;
              const currencySymbol = getCurrencySymbol(project.currency);
              const partnerKey = project.partnerId.toString();
              const companyName = getOrganizationName(partnerKey);
              const companyLogo = getOrganizationLogo(partnerKey);
              const logoUrl = companyLogo
                ? (companyLogo.startsWith("http") ? companyLogo : `${BASE_URL}/${companyLogo}`)
                : null;
              const projectKey = project.id?.toString() || "";
              const hasLogoError = logoErrors.has(projectKey);
              const companyColor = getOrganizationColor(partnerKey) || undefined;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.03, ease: "easeOut" }}
                >
                  <Card
                    className="hover:shadow-md transition-all cursor-pointer border-0 bg-paper"
                    style={companyColor ? { borderTop: `3px solid ${companyColor}` } : undefined}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {/* Company Logo */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-custom bg-very-pale-primary flex items-center justify-center overflow-hidden">
                            {logoUrl && !hasLogoError ? (
                              <img
                                src={logoUrl}
                                alt={companyName}
                                className="w-full h-full object-contain"
                                onError={() => {
                                  setLogoErrors(prev => new Set(prev).add(projectKey));
                                }}
                              />
                            ) : (
                              <Building2 size={20} className="text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/student/projects/${project.id}`}>
                              <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                                {project.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-secondary mb-2">{companyName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {hasApplied && (
                            <div
                              className="flex items-center gap-1 px-2 py-1 rounded text-[0.7rem] w-fit"
                              style={
                                companyColor
                                  ? { backgroundColor: companyColor, color: "#ffffff" }
                                  : undefined
                              }
                            >
                              <CheckCircle2 size={12} />
                              <span>Applied</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link href={`/student/projects/${project.id}`}>
                      <p className="text-sm text-secondary mb-4 line-clamp-2">
                        {stripHtmlTags(project.description)}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-pale-primary rounded text-[0.7rem]"
                            style={companyColor ? { color: companyColor } : undefined}
                          >
                            {skill}
                          </span>
                        ))}
                        {project.skills.length > 5 && (
                          <span className="px-2 py-1 bg-pale text-secondary rounded text-xs">
                            +{project.skills.length - 5}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-custom">
                        <div className="flex items-center gap-4 text-xs flex-wrap">
                          <div className="flex items-center gap-1">
                            <span
                              className="font-semibold"
                              style={companyColor ? { color: companyColor } : undefined}
                            >
                              {currencySymbol}
                              {formatCompactCurrency(
                                typeof project.budget === "number"
                                  ? project.budget
                                  : project.budget?.value || project.budget?.Value || 0
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} className="text-secondary" />
                            <span className="text-secondary">
                              {new Date(project.deadline).toLocaleDateString()}
                            </span>
                          </div>
                          {project.teamStructure && (
                            <div className="flex items-center gap-1">
                              <Users size={16} className="text-secondary" />
                              <span className="text-secondary">
                                {getTeamStructureLabel(project.teamStructure)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-custom">
                      {!hasApplied && project.id && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenApplicationForm(project.id!);
                          }}
                          className="flex-1 bg-primary dark:bg-custom hover:opacity-90 text-white text-sm py-2"
                        >
                          <Send size={14} className="mr-2" />
                          Apply
                        </Button>
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveProject(project.id);
                        }}
                        className={`${hasApplied ? "flex-1" : ""} ${savedProjects.has(project.id.toString()) ? "bg-primary text-white" : "bg-pale text-primary"} text-sm py-2`}
                      >
                        <Bookmark size={14} className="mr-2" fill={savedProjects.has(project.id.toString()) ? "currentColor" : "none"} />
                        {savedProjects.has(project.id.toString()) ? "Saved" : "Save"}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareProject(project);
                        }}
                        className={`${hasApplied ? "flex-1" : ""} bg-pale text-primary text-sm py-2`}
                      >
                        <Share2 size={14} className="mr-2" />
                        Share
                      </Button>
                      <Link href={`/student/projects/${project.id}`} className={hasApplied ? "flex-1" : ""}>
                        <Button className={`${hasApplied ? "w-full" : ""} bg-pale text-primary text-sm py-2`}>
                          <Eye size={14} className="mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <Card className="border-0 bg-paper">
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto mb-4 text-secondary opacity-50" />
                  <p className="text-muted mb-2 font-medium">No projects found</p>
                  <p className="text-sm text-muted-light mb-4">
                    {search || hasActiveFilters
                      ? "Try adjusting your search or filters"
                      : "Check back later for new projects"}
                  </p>
                  {(search || hasActiveFilters) && (
                    <Button onClick={() => {
                      setSearch("");
                      clearFilters();
                    }} className="bg-primary">
                      Clear Search & Filters
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Pagination Controls */}
            {totalProjects > 0 && (
              <div className="mt-6 space-y-4">
                {/* Pagination Info and Limit Selector */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-secondary">
                      Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalProjects)} of {totalProjects} projects
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-secondary">Per page:</label>
                      <div className="w-20">
                        <Select
                          value={pageSize.toString()}
                          onChange={(option) => {
                            const value = typeof option === "string" ? option : option.value;
                            const newPageSize = parseInt(value, 10);
                            setPageSize(newPageSize);
                            setCurrentPage(1); // Reset to first page when changing page size
                          }}
                          options={[
                            { value: "10", label: "10" },
                            { value: "20", label: "20" },
                            { value: "50", label: "50" },
                            { value: "100", label: "100" },
                          ]}
                          placeHolder="10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination Navigation */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="bg-pale text-primary text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="First page"
                    >
                      ««
                    </Button>
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="bg-pale text-primary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`text-sm py-2 px-3 min-w-[40px] ${currentPage === pageNum
                              ? "bg-primary text-white"
                              : "bg-pale text-primary hover:bg-pale-primary"
                              }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-pale text-primary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="bg-pale text-primary text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Last page"
                    >
                      »»
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Side Modal - using shared SideModal benchmark */}
      <SideModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={hasActiveFilters ? "Filters (active)" : "Filters"}
        width="480px"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">Budget Range</label>
            <div className="space-y-2">
              <Input
                type="text"
                value={minBudgetDisplay}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const parsed = parseFormattedValue(inputValue);
                  if (parsed === "" || /^\d+$/.test(parsed)) {
                    setMinBudget(parsed);
                    setMinBudgetDisplay(formatWithCommas(parsed));
                  }
                }}
                placeholder={`Min: ${budgetBounds.min.toLocaleString()}`}
                className="w-full"
              />
              <Input
                type="text"
                value={maxBudgetDisplay}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const parsed = parseFormattedValue(inputValue);
                  if (parsed === "" || /^\d+$/.test(parsed)) {
                    setMaxBudget(parsed);
                    setMaxBudgetDisplay(formatWithCommas(parsed));
                  }
                }}
                placeholder={`Max: ${budgetBounds.max.toLocaleString()}`}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-secondary">Skills</label>
            <div className="max-h-64 overflow-y-auto bg-pale p-3 rounded-lg space-y-2">
              {allSkills.length > 0 ? (
                allSkills.map((skill) => (
                  <label
                    key={skill}
                    className="flex items-center gap-2 cursor-pointer hover:bg-very-pale p-1 rounded transition-colors"
                  >
                    <Checkbox
                      checked={selectedSkills.has(skill)}
                      onChange={() => toggleSkill(skill)}
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-secondary">No skills available</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-custom flex items-center justify-between gap-3">
          <Button
            onClick={() => {
              clearFilters();
            }}
            className="bg-pale text-primary text-sm px-4 py-2"
            disabled={!hasActiveFilters}
          >
            <X size={14} className="mr-1" />
            Clear
          </Button>
          <Button
            onClick={() => setFiltersOpen(false)}
            className="bg-primary text-sm px-4 py-2"
          >
            Apply Filters
          </Button>
        </div>
      </SideModal>

      {/* Application Form Modal */}
      <ApplicationForm
        open={showApplicationForm}
        projectId={selectedProjectId}
        groups={groups}
        onClose={() => {
          if (!submittingApplication) {
            setShowApplicationForm(false);
            setSelectedProjectId("");
          }
        }}
        onSubmit={handleApplicationSubmit}
        submitting={submittingApplication}
      />
    </div>
  );
}

// Local keyframes for banner card "hop" animation
// (kept at bottom of file to avoid affecting other components)
// eslint-disable-next-line @next/next/no-css-tags
<style jsx global>{`
  @keyframes cardHop {
    0%,
    60%,
    100% {
      transform: translateY(0);
    }
    25% {
      transform: translateY(-10px);
    }
    40% {
      transform: translateY(-4px);
    }
  }
`}</style>