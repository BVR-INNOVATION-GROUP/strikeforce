"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import DataTable from "@/src/components/base/DataTable";
import { Column } from "@/src/components/base/DataTable";
import BarChart from "@/src/components/base/BarChart";
import { projectRepository } from "@/src/repositories/projectRepository";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { ProjectI } from "@/src/models/project";
import { OrganizationI } from "@/src/models/organization";
import { useToast } from "@/src/hooks/useToast";
import { Network, Building2, GraduationCap, Handshake } from "lucide-react";
import { useRouter } from "next/navigation";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Super Admin Collaborations - Stat cards, charts, table
 */
export default function SuperAdminCollaborationsPage() {
  const { showError } = useToast();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [projResult, orgs] = await Promise.all([
          projectRepository.getAll({ limit: 500 }),
          organizationRepository.getAll(),
        ]);
        setProjects(projResult.projects);
        setOrganizations(orgs);
      } catch (error) {
        console.error("Failed to load data:", error);
        showError("Failed to load collaborations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const partners = organizations.filter((o) => o.type === "PARTNER");
  const universities = organizations.filter((o) => o.type === "UNIVERSITY");

  const getPartnerName = (partnerId: number) => {
    const p = partners.find((o) => o.userId === partnerId || o.id === partnerId);
    return p?.name ?? `Partner #${partnerId}`;
  };

  const getUniversityName = (universityId: number) => {
    const u = universities.find((o) => o.id === universityId);
    return u?.name ?? `University #${universityId}`;
  };

  const getPartnerOrgId = (partnerId: number) => {
    const p = partners.find((o) => o.userId === partnerId || o.id === partnerId);
    return p?.id;
  };

  const matrix = useMemo(() => {
    const map = new Map<string, { count: number }>();
    for (const p of projects) {
      const key = `${p.partnerId}-${p.universityId}`;
      const existing = map.get(key);
      if (existing) existing.count++;
      else map.set(key, { count: 1 });
    }
    return map;
  }, [projects]);

  const uniquePairs = useMemo(() => {
    const pairs: { partnerId: number; universityId: number; count: number }[] = [];
    for (const [key, val] of matrix) {
      const [partnerId, universityId] = key.split("-").map(Number);
      pairs.push({ partnerId, universityId, count: val.count });
    }
    return pairs.sort((a, b) => b.count - a.count);
  }, [matrix]);

  const projectsByPartnerData = useMemo(() => {
    const byPartner = new Map<string, number>();
    projects.forEach((p) => {
      const name = getPartnerName(p.partnerId);
      byPartner.set(name, (byPartner.get(name) ?? 0) + 1);
    });
    return Array.from(byPartner.entries())
      .map(([name, count]) => ({ name, Projects: count }))
      .sort((a, b) => b.Projects - a.Projects)
      .slice(0, 10);
  }, [projects, partners]);

  const projectsByUniversityData = useMemo(() => {
    const byUni = new Map<string, number>();
    projects.forEach((p) => {
      const name = getUniversityName(p.universityId);
      byUni.set(name, (byUni.get(name) ?? 0) + 1);
    });
    return Array.from(byUni.entries())
      .map(([name, count]) => ({ name, Projects: count }))
      .sort((a, b) => b.Projects - a.Projects)
      .slice(0, 10);
  }, [projects, universities]);

  const tableData = useMemo(
    () =>
      uniquePairs.map((pair, i) => ({
        id: `${pair.partnerId}-${pair.universityId}-${i}`,
        partner: getPartnerName(pair.partnerId),
        university: getUniversityName(pair.universityId),
        projectCount: pair.count,
      })),
    [uniquePairs, partners, universities]
  );

  const columns: Column<typeof tableData[0]>[] = [
    { key: "partner", header: "Partner", sortable: true },
    { key: "university", header: "University", sortable: true },
    { key: "projectCount", header: "Projects", sortable: true },
  ];

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-full">
        <div className="flex-shrink-0 mb-8">
          <Skeleton width={200} height={24} className="mb-2" />
          <Skeleton width={300} height={16} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Collaborations</h1>
        <p className="text-[0.875rem] opacity-60">
          University–Partner relationships
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Building2 size={20} />} title="Partners" value={partners.length} />
        <StatCard icon={<GraduationCap size={20} />} title="Universities" value={universities.length} />
        <StatCard icon={<Handshake size={20} />} title="Collaborations" value={uniquePairs.length} />
        <StatCard icon={<Network size={20} />} title="Total Projects" value={projects.length} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="Projects by Partner (Top 10)"
          data={projectsByPartnerData}
          bars={[{ key: "Projects", label: "Projects" }]}
        />
        <BarChart
          title="Projects by University (Top 10)"
          data={projectsByUniversityData}
          bars={[{ key: "Projects", label: "Projects" }]}
        />
      </div>

      {/* Table */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Collaboration Matrix</h2>
        <DataTable
          data={tableData}
          columns={columns}
          showCheckboxes={false}
          showActions={false}
          pageSize={10}
          emptyMessage="No collaborations found"
          onRowClick={(row) => {
            const pair = uniquePairs.find(
              (p) =>
                getPartnerName(p.partnerId) === row.partner &&
                getUniversityName(p.universityId) === row.university
            );
            if (pair) {
              const orgId = getPartnerOrgId(pair.partnerId);
              if (orgId) router.push(`/super-admin/partners/${orgId}`);
            }
          }}
        />
      </Card>
    </div>
  );
}
