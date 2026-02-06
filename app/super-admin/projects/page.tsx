"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import Select from "@/src/components/core/Select";
import { OptionI } from "@/src/components/core/Select";
import DataTable from "@/src/components/base/DataTable";
import { Column } from "@/src/components/base/DataTable";
import BarChart from "@/src/components/base/BarChart";
import LineChart from "@/src/components/base/LineChart";
import { projectRepository } from "@/src/repositories/projectRepository";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { ProjectI } from "@/src/models/project";
import { OrganizationI } from "@/src/models/organization";
import { useToast } from "@/src/hooks/useToast";
import { Briefcase, Building2, GraduationCap, Filter, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Super Admin Projects - Platform-wide view with stat cards, charts, and table
 */
export default function SuperAdminProjectsPage() {
  const { showError } = useToast();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [partnerFilter, setPartnerFilter] = useState<string>("");
  const [universityFilter, setUniversityFilter] = useState<string>("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const result = await projectRepository.getAll({ limit: 500 });
      setProjects(result.projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      showError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const orgs = await organizationRepository.getAll();
      setOrganizations(orgs);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const partners = organizations.filter((o) => o.type === "PARTNER");
  const universities = organizations.filter((o) => o.type === "UNIVERSITY");

  const statusOptions: OptionI[] = useMemo(
    () => [
      { label: "All statuses", value: "" },
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
      { label: "In Progress", value: "in-progress" },
      { label: "Completed", value: "completed" },
    ],
    []
  );
  const partnerOptions: OptionI[] = useMemo(
    () => [
      { label: "All partners", value: "" },
      ...partners.map((p) => ({ label: p.name, value: String(p.userId ?? p.id) })),
    ],
    [partners]
  );
  const universityOptions: OptionI[] = useMemo(
    () => [
      { label: "All universities", value: "" },
      ...universities.map((u) => ({ label: u.name, value: String(u.id) })),
    ],
    [universities]
  );

  const getPartnerName = (partnerId: number) => {
    const p = partners.find((o) => o.userId === partnerId || o.id === partnerId);
    return p?.name ?? `Partner #${partnerId}`;
  };

  const getPartnerOrgId = (partnerId: number) => {
    const p = partners.find((o) => o.userId === partnerId || o.id === partnerId);
    return p?.id;
  };

  const getUniversityName = (universityId: number) => {
    const u = universities.find((o) => o.id === universityId);
    return u?.name ?? `University #${universityId}`;
  };

  const getBudgetValue = (p: ProjectI): number => {
    if (typeof p.budget === "number") return p.budget;
    if (p.budget && typeof p.budget === "object") {
      const b = p.budget as { Value?: number; value?: number };
      return b.Value ?? b.value ?? 0;
    }
    return 0;
  };

  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (partnerFilter) list = list.filter((p) => String(p.partnerId) === partnerFilter || String(getPartnerOrgId(p.partnerId)) === partnerFilter);
    if (universityFilter) list = list.filter((p) => String(p.universityId) === universityFilter);
    return list;
  }, [projects, statusFilter, partnerFilter, universityFilter, partners]);

  const stats = useMemo(() => {
    const draft = filteredProjects.filter((p) => p.status === "draft").length;
    const published = filteredProjects.filter((p) => p.status === "published").length;
    const inProgress = filteredProjects.filter((p) => p.status === "in-progress").length;
    const completed = filteredProjects.filter((p) => p.status === "completed").length;
    const totalBudget = filteredProjects.reduce((sum, p) => sum + getBudgetValue(p), 0);
    return { total: filteredProjects.length, draft, published, inProgress, completed, totalBudget };
  }, [filteredProjects]);

  const statusChartData = useMemo(
    () => [
      { name: "Draft", value: stats.draft },
      { name: "Published", value: stats.published },
      { name: "In Progress", value: stats.inProgress },
      { name: "Completed", value: stats.completed },
    ],
    [stats]
  );

  const projectsByPartnerData = useMemo(() => {
    const byPartner = new Map<string, number>();
    filteredProjects.forEach((p) => {
      const name = getPartnerName(p.partnerId);
      byPartner.set(name, (byPartner.get(name) ?? 0) + 1);
    });
    return Array.from(byPartner.entries())
      .map(([name, count]) => ({ name, Projects: count }))
      .sort((a, b) => b.Projects - a.Projects)
      .slice(0, 10);
  }, [filteredProjects, partners]);

  const projectsOverTimeData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return [6, 5, 4, 3, 2, 1].map((monthOffset) => {
      const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const monthStart = d.toISOString();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
      const count = filteredProjects.filter((p) => {
        const created = new Date(p.createdAt);
        return created >= new Date(monthStart) && created <= new Date(monthEnd);
      }).length;
      return { name: months[d.getMonth()], Projects: count };
    }).reverse();
  }, [filteredProjects]);

  const tableData = useMemo(
    () =>
      filteredProjects.map((p) => ({
        id: String(p.id),
        title: p.title,
        partner: getPartnerName(p.partnerId),
        university: getUniversityName(p.universityId),
        status: p.status,
        budget: `${p.currency || "USD"} ${getBudgetValue(p).toLocaleString()}`,
        budgetValue: getBudgetValue(p),
        createdAt: p.createdAt,
      })),
    [filteredProjects, partners, universities]
  );

  const columns: Column<typeof tableData[0]>[] = [
    { key: "title", header: "Title", sortable: true },
    { key: "partner", header: "Partner", sortable: true },
    { key: "university", header: "University", sortable: true },
    { key: "status", header: "Status", sortable: true },
    {
      key: "budgetValue",
      header: "Budget",
      sortable: true,
      render: (item) => item.budget,
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Projects</h1>
        <p className="text-[0.875rem] opacity-60">All projects on the platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard icon={<Briefcase size={20} />} title="Total" value={stats.total} />
        <StatCard icon={<FileText size={20} />} title="Draft" value={stats.draft} />
        <StatCard icon={<FileText size={20} />} title="Published" value={stats.published} />
        <StatCard icon={<FileText size={20} />} title="In Progress" value={stats.inProgress} />
        <StatCard icon={<FileText size={20} />} title="Completed" value={stats.completed} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="Projects by Status"
          data={statusChartData}
          bars={[{ key: "value", label: "Projects" }]}
        />
        <BarChart
          title="Projects by Partner (Top 10)"
          data={projectsByPartnerData}
          bars={[{ key: "Projects", label: "Projects" }]}
        />
      </div>
      <div className="mb-8">
        <LineChart
          title="Projects Created Over Time"
          data={projectsOverTimeData}
          lines={[{ key: "Projects", label: "Projects" }]}
        />
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[180px]">
            <Select
              title="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(opt) => setStatusFilter(typeof opt === "object" ? String(opt.value) : opt)}
              placeHolder="All statuses"
              searchable
            />
          </div>
          <div className="min-w-[180px]">
            <Select
              title="Partner"
              options={partnerOptions}
              value={partnerFilter}
              onChange={(opt) => setPartnerFilter(typeof opt === "object" ? String(opt.value) : opt)}
              placeHolder="All partners"
              searchable
            />
          </div>
          <div className="min-w-[180px]">
            <Select
              title="University"
              options={universityOptions}
              value={universityFilter}
              onChange={(opt) => setUniversityFilter(typeof opt === "object" ? String(opt.value) : opt)}
              placeHolder="All universities"
              searchable
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">All Projects</h2>
        <DataTable
          data={tableData}
          columns={columns}
          showCheckboxes={false}
          showActions={false}
          pageSize={10}
          emptyMessage="No projects found"
          onRowClick={(row) => {
            const orgId = getPartnerOrgId(filteredProjects.find((p) => String(p.id) === row.id)?.partnerId ?? 0);
            if (orgId) router.push(`/super-admin/partners/${orgId}`);
          }}
        />
      </Card>
    </div>
  );
}
