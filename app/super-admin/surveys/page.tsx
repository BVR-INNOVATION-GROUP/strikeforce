"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import Select from "@/src/components/core/Select";
import { OptionI } from "@/src/components/core/Select";
import DataTable from "@/src/components/base/DataTable";
import { Column } from "@/src/components/base/DataTable";
import BarChart from "@/src/components/base/BarChart";
import { adminRepository, DNASurveyItem } from "@/src/repositories/adminRepository";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { useToast } from "@/src/hooks/useToast";
import { ClipboardList, Filter, CheckCircle, XCircle } from "lucide-react";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Super Admin DNA Surveys - Student DNA Snapshot completion status
 */
export default function SuperAdminSurveysPage() {
  const { showError } = useToast();
  const [surveys, setSurveys] = useState<DNASurveyItem[]>([]);
  const [organizations, setOrganizations] = useState<{ id: number; name: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [universityFilter, setUniversityFilter] = useState<string>("");
  const [completedFilter, setCompletedFilter] = useState<string>("");

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const filters: { universityId?: number; completed?: boolean } = {};
      if (universityFilter) filters.universityId = parseInt(universityFilter, 10);
      if (completedFilter === "true") filters.completed = true;
      else if (completedFilter === "false") filters.completed = false;
      const data = await adminRepository.getStudentSurveys(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      setSurveys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch surveys:", error);
      showError("Failed to load DNA surveys");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgs = async () => {
    try {
      const orgs = await organizationRepository.getAll();
      setOrganizations(orgs.map((o) => ({ id: o.id, name: o.name, type: o.type })));
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [universityFilter, completedFilter]);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const universities = organizations.filter((o) => o.type === "UNIVERSITY");

  const universityOptions: OptionI[] = useMemo(
    () => [
      { label: "All universities", value: "" },
      ...universities.map((u) => ({ label: u.name, value: String(u.id) })),
    ],
    [universities]
  );

  const completedOptions: OptionI[] = [
    { label: "All", value: "" },
    { label: "Completed", value: "true" },
    { label: "Not completed", value: "false" },
  ];

  const stats = useMemo(() => {
    const completed = surveys.filter((s) => s.hasCompleted).length;
    const notCompleted = surveys.length - completed;
    const byArchetype = new Map<string, number>();
    surveys.forEach((s) => {
      const arch = s.dnaArchetype || "Unknown";
      byArchetype.set(arch, (byArchetype.get(arch) ?? 0) + 1);
    });
    return {
      total: surveys.length,
      completed,
      notCompleted,
      byArchetype: Array.from(byArchetype.entries()).map(([name, Count]) => ({ name, Count })),
    };
  }, [surveys]);

  const tableData = useMemo(
    () =>
      surveys.map((s) => ({
        id: String(s.studentId),
        name: s.studentName,
        email: s.studentEmail,
        university: s.universityName,
        course: s.courseName,
        completed: s.hasCompleted ? "Yes" : "No",
        archetype: s.dnaArchetype ?? "—",
        completedAt: s.completedAt ?? "—",
      })),
    [surveys]
  );

  const columns: Column<typeof tableData[0]>[] = [
    { key: "name", header: "Student", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "university", header: "University", sortable: true },
    { key: "course", header: "Course", sortable: true },
    { key: "completed", header: "Completed", sortable: true },
    { key: "archetype", header: "Archetype", sortable: true },
    { key: "completedAt", header: "Completed At", sortable: true },
  ];

  if (loading && surveys.length === 0) {
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
        <h1 className="text-[1rem] font-[600] mb-2">DNA Surveys</h1>
        <p className="text-[0.875rem] opacity-60">
          Student DNA Snapshot completion status and archetypes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<ClipboardList size={20} />} title="Total Students" value={stats.total} />
        <StatCard
          icon={<CheckCircle size={20} />}
          title="Completed"
          value={stats.completed}
        />
        <StatCard
          icon={<XCircle size={20} />}
          title="Not Completed"
          value={stats.notCompleted}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="By Archetype"
          data={stats.byArchetype.slice(0, 10)}
          bars={[{ key: "Count", label: "Count" }]}
        />
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px]">
            <Select
              title="University"
              options={universityOptions}
              value={universityFilter}
              onChange={(opt) => setUniversityFilter(typeof opt === "object" ? String(opt.value) : opt)}
              placeHolder="All universities"
              searchable
            />
          </div>
          <div className="min-w-[200px]">
            <Select
              title="Completion"
              options={completedOptions}
              value={completedFilter}
              onChange={(opt) => setCompletedFilter(typeof opt === "object" ? String(opt.value) : opt)}
              placeHolder="All"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">DNA Survey Results</h2>
        <DataTable
          data={tableData}
          columns={columns}
          showCheckboxes={false}
          showActions={false}
          pageSize={10}
          emptyMessage="No survey data found"
        />
      </Card>
    </div>
  );
}
