"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import DataTable from "@/src/components/base/DataTable";
import { Column } from "@/src/components/base/DataTable";
import BarChart from "@/src/components/base/BarChart";
import Select from "@/src/components/core/Select";
import { OptionI } from "@/src/components/core/Select";
import { projectRepository } from "@/src/repositories/projectRepository";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { useToast } from "@/src/hooks/useToast";
import { FileStack, ExternalLink, Filter, FileText, Image } from "lucide-react";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Super Admin Files - Stat cards, charts, table with filters
 */
export default function SuperAdminFilesPage() {
  const { showError } = useToast();
  const [projects, setProjects] = useState<{ id: number; title: string; attachments?: string[]; mouUrl?: string }[]>([]);
  const [organizations, setOrganizations] = useState<{ id: number; name: string; logo?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [projResult, orgs] = await Promise.all([
          projectRepository.getAll({ limit: 500 }),
          organizationRepository.getAll(),
        ]);
        setProjects(projResult.projects.map((p) => ({
          id: p.id,
          title: p.title,
          attachments: p.attachments,
          mouUrl: p.mouUrl,
        })));
        setOrganizations(orgs.map((o) => ({ id: o.id, name: o.name, logo: o.logo })));
      } catch (error) {
        console.error("Failed to load files:", error);
        showError("Failed to load files");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const projectFiles = projects.flatMap((p) => {
    const files: { url: string; type: string; source: string }[] = [];
    if (p.mouUrl) files.push({ url: p.mouUrl, type: "MOU", source: `Project: ${p.title}` });
    if (p.attachments?.length) {
      for (const url of p.attachments) {
        files.push({ url, type: "Attachment", source: `Project: ${p.title}` });
      }
    }
    return files;
  });

  const orgFiles = organizations
    .filter((o) => o.logo)
    .map((o) => ({ url: o.logo!, type: "Logo", source: `Org: ${o.name}` }));

  const allFilesRaw = useMemo(() => [
    ...projectFiles.map((f, i) => ({ ...f, id: `p-${i}-${f.url}` })),
    ...orgFiles.map((f, i) => ({ ...f, id: `o-${i}-${f.url}` })),
  ], [projectFiles, orgFiles]);

  const allFiles = useMemo(() => {
    if (typeFilter) return allFilesRaw.filter((f) => f.type === typeFilter);
    return allFilesRaw;
  }, [allFilesRaw, typeFilter]);

  const tableData = useMemo(
    () =>
      allFiles.map((f, i) => ({
        id: f.id ?? `file-${i}`,
        source: f.source,
        type: f.type,
        url: f.url,
      })),
    [allFiles]
  );

  const typeOptions: OptionI[] = [
    { label: "All types", value: "" },
    { label: "MOU", value: "MOU" },
    { label: "Attachment", value: "Attachment" },
    { label: "Logo", value: "Logo" },
  ];

  const typeChartData = useMemo(() => {
    const mou = projectFiles.filter((f) => f.type === "MOU").length;
    const attachment = projectFiles.filter((f) => f.type === "Attachment").length;
    const logo = orgFiles.length;
    return [
      { name: "MOU", Count: mou },
      { name: "Attachments", Count: attachment },
      { name: "Logos", Count: logo },
    ];
  }, [projectFiles, orgFiles]);

  const filesPerProjectData = useMemo(() => {
    const byProject = new Map<string, number>();
    projects.forEach((p) => {
      let count = p.mouUrl ? 1 : 0;
      count += p.attachments?.length ?? 0;
      if (count > 0) byProject.set(p.title, count);
    });
    return Array.from(byProject.entries())
      .map(([name, count]) => ({ name, Files: count }))
      .sort((a, b) => b.Files - a.Files)
      .slice(0, 10);
  }, [projects]);

  const stats = useMemo(() => ({
    total: allFilesRaw.length,
    mou: projectFiles.filter((f) => f.type === "MOU").length,
    attachments: projectFiles.filter((f) => f.type === "Attachment").length,
    logos: orgFiles.length,
  }), [allFilesRaw, projectFiles, orgFiles]);

  const columns: Column<typeof tableData[0]>[] = [
    { key: "source", header: "Source", sortable: true },
    { key: "type", header: "Type", sortable: true },
    {
      key: "url",
      header: "Link",
      sortable: false,
      render: (item) => (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline text-sm"
        >
          <ExternalLink size={14} />
          Open
        </a>
      ),
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
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Files</h1>
        <p className="text-[0.875rem] opacity-60">
          File URLs from projects and organizations (Cloudinary)
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<FileStack size={20} />} title="Total Files" value={stats.total} />
        <StatCard icon={<FileText size={20} />} title="MOU Documents" value={stats.mou} />
        <StatCard icon={<FileText size={20} />} title="Attachments" value={stats.attachments} />
        <StatCard icon={<Image size={20} />} title="Logos" value={stats.logos} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="Files by Type"
          data={typeChartData}
          bars={[{ key: "Count", label: "Count" }]}
        />
        <BarChart
          title="Files per Project (Top 10)"
          data={filesPerProjectData}
          bars={[{ key: "Files", label: "Files" }]}
        />
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="min-w-[180px]">
          <Select
            title="Type"
            options={typeOptions}
            value={typeFilter}
            onChange={(opt) => setTypeFilter(String(typeof opt === "object" ? (opt as OptionI).value : opt))}
            placeHolder="All types"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">All Files</h2>
        <DataTable
          data={tableData}
          columns={columns}
          showCheckboxes={false}
          showActions={false}
          pageSize={10}
          emptyMessage="No files found"
        />
      </Card>
    </div>
  );
}
