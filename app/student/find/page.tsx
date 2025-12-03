"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import { Search, Filter, X, Clock, CheckCircle2, Bookmark, Share2, Eye, Send } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/src/store";
import { useToast } from "@/src/hooks/useToast";
import { currenciesArray } from "@/src/constants/currencies";
import { GroupI } from "@/src/models/group";
import { stripHtmlTags } from "@/src/utils/htmlUtils";

/**
 * Student Find Projects - Upwork-style layout with Google-like search
 * PRD Reference: Section 6 - Groups and Applications
 * Layout: Projects on left (scrollable), Filters on right (scrollable, sticky)
 */
export default function StudentProjects() {
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectI[]>([]);
  const [userApplications, setUserApplications] = useState<ApplicationI[]>([]);
  const [organizations, setOrganizations] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<GroupI[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
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
  const getApplicationStatus = (projectId: string | number | undefined): ApplicationI | null => {
    if (!projectId) return null;
    return userApplications.find(
      (app) => app.projectId && app.projectId.toString() === projectId.toString()
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects with pagination, applications, and groups
        const [projectsResult, applicationsData, usersData] = await Promise.all([
          projectService.getAllProjects({ page: currentPage, limit: pageSize }),
          applicationService.getUserApplications(),
          import("@/src/data/mockUsers.json"),
        ]);

        setProjects(projectsResult.projects);
        setTotalPages(projectsResult.totalPages);
        setTotalProjects(projectsResult.total);
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

        // Build organization map from users
        const users = usersData.default as Array<{ id: number | string; orgId?: number | string; name: string }>;
        const orgsData = await import("@/src/data/mockOrganizations.json");
        const orgs = orgsData.default as Array<{ id: number | string; name: string }>;

        const orgMap: Record<string, string> = {};
        projectsResult.projects.forEach((project) => {
          const user = users.find((u) => u.id.toString() === project.partnerId.toString());
          if (user?.orgId) {
            const org = orgs.find((o) => o.id.toString() === user.orgId?.toString());
            if (org) {
              orgMap[project.partnerId.toString()] = org.name;
            }
          }
        });
        setOrganizations(orgMap);
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

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="w-full flex flex-col h-full">
      {/* Google-like Search Bar */}
      <div className="flex-shrink-0 mb-6 flex justify-center">
        <div className="w-full max-w-4xl gap-2 relative flex items-center justify-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full h-15 pl-8 text-base bg-paper rounded-full outline-none"
          />

          <div className="bg-primary rounded-full min-w-14 h-14 w-14 flex items-center justify-center">
            <Search size={20} className="  text-white" />
          </div>

        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left: Projects List (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-secondary">
                Showing {filteredProjects.length} of {totalProjects} {totalProjects === 1 ? "project" : "projects"}
              </p>
            </div>

            {/* Projects List */}
            {filteredProjects.map((project) => {
              const application = getApplicationStatus(project.id);
              const hasApplied = !!application;
              const currencySymbol = getCurrencySymbol(project.currency);
              const companyName = getOrganizationName(project.partnerId.toString());

              return (
                <Card key={project.id} className="hover:shadow-md transition-all cursor-pointer border-0 bg-paper">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link href={`/student/projects/${project.id}`}>
                        <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-secondary mb-2">{companyName}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {hasApplied && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-pale-primary rounded text-xs text-primary w-fit">
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
                          className="px-2 py-1 bg-pale-primary text-primary rounded text-xs"
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
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{currencySymbol}{project.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} className="text-secondary" />
                          <span className="text-secondary">
                            {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        </div>
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
                        className="flex-1 bg-primary text-sm py-2"
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
                            className={`text-sm py-2 px-3 min-w-[40px] ${
                              currentPage === pageNum
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

        {/* Right: Filters Sidebar (Sticky, Scrollable) */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-0">
            <Card className="border-0 bg-paper">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} className="bg-pale text-primary text-xs px-3 py-1">
                    <X size={14} className="mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {/* Budget Range - Min and Max on different rows */}
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

                {/* Skills Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary">Skills</label>
                  <div className="max-h-64 overflow-y-auto bg-pale p-3 rounded-lg space-y-2">
                    {allSkills.length > 0 ? (
                      allSkills.map((skill) => (
                        <label key={skill} className="flex items-center gap-2 cursor-pointer hover:bg-very-pale p-1 rounded transition-colors">
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
            </Card>
          </div>
        </div>
      </div>

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