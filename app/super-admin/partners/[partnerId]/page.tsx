"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { projectRepository } from "@/src/repositories/projectRepository";
import { organizationService } from "@/src/services/organizationService";
import { OrganizationI } from "@/src/models/organization";
import { ProjectI } from "@/src/models/project";
import { Building2, ArrowLeft, Briefcase, GraduationCap } from "lucide-react";
import { useToast } from "@/src/hooks/useToast";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Super Admin Partner Detail - Drill-down into partner with all projects
 */
export default function SuperAdminPartnerDetailPage() {
  const router = useRouter();
  const params = useParams<{ partnerId?: string | string[] }>();
  const { showError } = useToast();

  const partnerId = useMemo(() => {
    const value = params?.partnerId;
    if (Array.isArray(value)) return value[0] || "";
    return value || "";
  }, [params?.partnerId]);

  const [partner, setPartner] = useState<OrganizationI | null>(null);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    if (!partnerId || partnerId.trim() === "") {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await organizationService.getOrganization(partnerId);
        setPartner(data);
      } catch (error) {
        console.error("Failed to load partner:", error);
        showError("Failed to load partner");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [partnerId]);

  useEffect(() => {
    if (!partnerId || !partner) return;
    const loadProjects = async () => {
      setProjectsLoading(true);
      try {
        const result = await projectRepository.getAll({
          partnerId: partnerId,
          limit: 50,
        });
        setProjects(result.projects);
      } catch (error) {
        console.error("Failed to load projects:", error);
        showError("Failed to load projects");
      } finally {
        setProjectsLoading(false);
      }
    };
    loadProjects();
  }, [partnerId, partner]);

  const getBudgetValue = (project: ProjectI): number => {
    if (typeof project.budget === "number") return project.budget;
    if (project.budget && typeof project.budget === "object") {
      const b = project.budget as { Value?: number; value?: number };
      return b.Value ?? b.value ?? 0;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        <Skeleton width={120} height={40} className="mb-6" />
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <Skeleton width={56} height={56} rounded="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton width={200} height={24} />
              <Skeleton width={150} height={16} />
            </div>
          </div>
        </Card>
        <Skeleton width={150} height={24} className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" rounded="lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        <Card className="text-center py-12">
          <p className="text-secondary mb-4">Partner not found</p>
          <Button onClick={() => router.push("/super-admin/partners")}>
            Back to Partners
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/super-admin/partners")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
      </div>

      {/* Partner info */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Building2 size={32} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-semibold">{partner.name}</h1>
              <StatusIndicator status={partner.kycStatus} />
            </div>
            <p className="text-sm opacity-60">{partner.email}</p>
            {partner.billingProfile?.contactName && (
              <p className="text-sm mt-1">Contact: {partner.billingProfile.contactName}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Projects */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4">Projects</h2>
        {projectsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" rounded="lg" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="py-12 text-center">
            <Briefcase size={48} className="mx-auto mb-4 opacity-40" />
            <p className="opacity-60">No projects found</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{p.title}</h3>
                    <p className="text-sm opacity-60 mt-1">
                      {p.currency || "USD"} {getBudgetValue(p).toLocaleString()} · {p.status}
                    </p>
                  </div>
                  <StatusIndicator status={p.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
