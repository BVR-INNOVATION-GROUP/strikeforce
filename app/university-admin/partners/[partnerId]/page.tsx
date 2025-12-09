/**
 * Partner Details Page for University Admin
 * Shows partner information and projects uploaded only in their university
 */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { organizationService } from "@/src/services/organizationService";
import { projectService } from "@/src/services/projectService";
import { OrganizationI } from "@/src/models/organization";
import { ProjectI } from "@/src/models/project";
import { Building2, ArrowLeft, Clock, Briefcase, Eye } from "lucide-react";
import { BASE_URL } from "@/src/api/client";
import { useAuthStore } from "@/src/store";
import { currenciesArray } from "@/src/constants/currencies";
import { stripHtmlTags } from "@/src/utils/htmlUtils";

export default function PartnerDetailsPage() {
    const router = useRouter();
    const params = useParams<{ partnerId?: string | string[] }>();
    const { user, organization: storedOrganization } = useAuthStore();

    const partnerId = useMemo(() => {
        const value = params?.partnerId;
        if (Array.isArray(value)) {
            return value[0] || "";
        }
        return value || "";
    }, [params?.partnerId]);

    const [partner, setPartner] = useState<OrganizationI | null>(null);
    const [projects, setProjects] = useState<ProjectI[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectsPage, setProjectsPage] = useState(1);
    const [projectsLimit] = useState(12);
    const [projectsTotal, setProjectsTotal] = useState(0);
    const [projectsTotalPages, setProjectsTotalPages] = useState(1);
    const [projectsLoading, setProjectsLoading] = useState(false);

    // Get university ID for filtering projects
    const universityId = useMemo(() => {
        return storedOrganization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);
    }, [storedOrganization?.id, user?.role, user?.orgId, user?.universityId]);

    useEffect(() => {
        if (!partnerId || partnerId.trim() === "") {
            setLoading(false);
            return;
        }
        loadPartnerData();
    }, [partnerId]);

    useEffect(() => {
        if (partnerId && universityId) {
            loadProjects(partnerId, universityId, projectsPage);
        }
    }, [partnerId, universityId, projectsPage]);

    /**
     * Load partner organization data
     */
    const loadPartnerData = async () => {
        try {
            const partnerData = await organizationService.getOrganization(partnerId);
            setPartner(partnerData);
        } catch (error) {
            console.error("Failed to load partner:", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Load projects for this partner in the university admin's university
     */
    const loadProjects = async (partnerIdStr: string, uniId: string | number | undefined, page: number) => {
        if (!uniId) {
            setProjectsLoading(false);
            return;
        }

        setProjectsLoading(true);
        try {
            const numericPartnerId = parseInt(partnerIdStr, 10);
            const numericUniversityId = typeof uniId === 'string' ? parseInt(uniId, 10) : uniId;

            const result = await projectService.getAllProjects({
                partnerId: numericPartnerId,
                universityId: numericUniversityId.toString(),
                page,
                limit: projectsLimit,
            });

            setProjects(result.projects);
            setProjectsTotal(result.total);
            setProjectsTotalPages(result.totalPages);
        } catch (error) {
            console.error("Failed to load projects:", error);
        } finally {
            setProjectsLoading(false);
        }
    };

    /**
     * Get currency symbol for display
     */
    const getCurrencySymbol = (currency: string): string => {
        const currencyInfo = currenciesArray.find((c) => c.code === currency);
        return currencyInfo?.symbol || currency;
    };

    /**
     * Get budget value from project (handles both number and object formats)
     */
    const getBudgetValue = (project: ProjectI): number => {
        if (typeof project.budget === 'number') {
            return project.budget;
        }
        if (project.budget && typeof project.budget === 'object' && !Array.isArray(project.budget)) {
            const budgetObj = project.budget as any;
            return budgetObj.Value !== undefined ? budgetObj.Value : (budgetObj.value !== undefined ? budgetObj.value : 0);
        }
        return 0;
    };

    /**
     * Check if project is published
     */
    const isPublished = (status: string): boolean => {
        const normalizedStatus = (status || "").toLowerCase();
        return normalizedStatus === "published";
    };

    if (loading) {
        return (
            <div className="w-full flex flex-col h-full overflow-hidden p-4">
                <p className="text-secondary">Loading partner details...</p>
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="w-full flex flex-col h-full overflow-hidden p-4">
                <Card className="text-center py-12">
                    <Building2 size={48} className="text-muted-light mx-auto mb-4" />
                    <p className="text-secondary mb-2">Partner not found</p>
                    <Button onClick={() => router.push("/university-admin/partners")} className="mt-4">
                        <ArrowLeft size={16} />
                        Back to Partners
                    </Button>
                </Card>
            </div>
        );
    }

    const createdAt = new Date(partner.createdAt);
    const activeProjects = projects.filter((p) => p.status === "in-progress");

    return (
        <div className="w-full flex flex-col min-h-full">
            {/* Header with Back Button */}
            <div className="flex-shrink-0 mb-6">
                <Button
                    onClick={() => router.push("/university-admin/partners")}
                    className="mb-4 bg-pale text-primary flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back to Partners
                </Button>

                {/* Partner Info Card */}
                <Card className="mb-6">
                    <div className="flex items-start gap-4">
                        {partner.logo ? (
                            <img
                                src={partner.logo.startsWith("http") ? partner.logo : `${BASE_URL}/${partner.logo}`}
                                alt={partner.name}
                                className="w-20 h-20 object-contain rounded-lg border border-custom bg-paper p-2"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-lg border border-custom bg-pale flex items-center justify-center">
                                <Building2 size={32} className="text-muted-light" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-2xl font-semibold text-default mb-2">{partner.name}</h1>
                            {partner.website && (
                                <a
                                    href={partner.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted hover:text-default hover:underline mb-2 block"
                                >
                                    {partner.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                            <div className="flex items-center gap-4 mt-4 text-sm text-secondary">
                                <div className="flex items-center gap-2">
                                    <Briefcase size={16} className="text-muted-light" />
                                    <span>{projects.length} project{projects.length !== 1 ? 's' : ''} in your university</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-muted-light" />
                                    <span>Joined {createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Projects Section */}
            <div className="flex-1">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-default mb-2">Projects</h2>
                    <p className="text-sm text-secondary">
                        Projects uploaded by {partner.name} in your university
                    </p>
                </div>

                {projectsLoading ? (
                    <div className="text-center py-12 bg-paper rounded-lg">
                        <p className="text-[0.875rem] opacity-60">Loading projects...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <Card className="text-center py-12">
                        <Briefcase size={48} className="text-muted-light mx-auto mb-4" />
                        <p className="text-secondary mb-2">No projects found</p>
                        <p className="text-sm text-muted">
                            This partner hasn't uploaded any projects in your university yet.
                        </p>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {projects.map((project) => {
                                const currencySymbol = getCurrencySymbol(project.currency);
                                const projectIsPublished = isPublished(project.status);

                                return (
                                    <Card key={project.id} className="hover:shadow-md transition-all border-0 bg-paper">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <Link href={`/university-admin/projects/${project.id}`}>
                                                    <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                                                        {project.title}
                                                    </h3>
                                                </Link>
                                                <div className="flex items-center gap-2 flex-wrap mt-2">
                                                    <StatusIndicator status={project.status} />
                                                </div>
                                            </div>
                                        </div>

                                        <Link href={`/university-admin/projects/${project.id}`}>
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
                                                        <span className="font-semibold">
                                                            {currencySymbol}{getBudgetValue(project).toLocaleString()}
                                                        </span>
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

                                        {/* View Button */}
                                        <div className="flex items-center justify-start gap-2 mt-4 pt-4 border-t border-custom">
                                            <Link href={`/university-admin/projects/${project.id}`}>
                                                <Button className="w-max bg-pale text-primary text-sm py-2 flex items-center justify-center gap-2">
                                                    <Eye size={14} />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {projectsTotalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-custom pt-4">
                                <div className="text-sm text-secondary">
                                    Showing {((projectsPage - 1) * projectsLimit) + 1} - {Math.min(projectsPage * projectsLimit, projectsTotal)} of {projectsTotal} projects
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setProjectsPage((prev) => Math.max(1, prev - 1))}
                                        disabled={projectsPage === 1}
                                        className={`px-3 py-1.5 rounded text-sm border border-custom flex items-center gap-1 ${projectsPage === 1
                                                ? 'text-muted-light cursor-not-allowed opacity-50'
                                                : 'text-secondary hover:bg-pale'
                                            }`}
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, projectsTotalPages) }, (_, i) => {
                                            let pageNum: number;
                                            if (projectsTotalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (projectsPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (projectsPage >= projectsTotalPages - 2) {
                                                pageNum = projectsTotalPages - 4 + i;
                                            } else {
                                                pageNum = projectsPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setProjectsPage(pageNum)}
                                                    className={`px-3 py-1.5 rounded text-sm border ${projectsPage === pageNum
                                                            ? 'bg-primary text-white border-primary'
                                                            : 'border-custom text-secondary hover:bg-pale'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setProjectsPage((prev) => Math.min(projectsTotalPages, prev + 1))}
                                        disabled={projectsPage === projectsTotalPages}
                                        className={`px-3 py-1.5 rounded text-sm border border-custom flex items-center gap-1 ${projectsPage === projectsTotalPages
                                                ? 'text-muted-light cursor-not-allowed opacity-50'
                                                : 'text-secondary hover:bg-pale'
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

