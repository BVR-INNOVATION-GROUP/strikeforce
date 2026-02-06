"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import BarChart from "@/src/components/base/BarChart";
import LineChart from "@/src/components/base/LineChart";
import DataTable from "@/src/components/base/DataTable";
import { Column } from "@/src/components/base/DataTable";
import { useToast } from "@/src/hooks/useToast";
import { DollarSign, Briefcase, Layers, TrendingUp } from "lucide-react";
import { api } from "@/src/api/client";
import Skeleton from "@/src/components/core/Skeleton";

interface FinancialSummary {
  totalProjectBudget: number;
  totalMilestoneAmount: number;
  byCurrency?: Record<string, number>;
  projectCount: number;
  milestoneCount: number;
}

/**
 * Super Admin Finance - Stat cards, charts, and table
 */
export default function SuperAdminFinancePage() {
  const { showError } = useToast();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get<FinancialSummary>(
          "/api/v1/admin/financial-summary"
        );
        setSummary(response);
      } catch (error) {
        console.error("Failed to fetch financial summary:", error);
        showError("Failed to load financial summary");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const budgetVsMilestoneData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Project Budget", Amount: summary.totalProjectBudget },
      { name: "Milestone Amount", Amount: summary.totalMilestoneAmount },
    ];
  }, [summary]);

  const countsData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Projects", Count: summary.projectCount },
      { name: "Milestones", Count: summary.milestoneCount },
    ];
  }, [summary]);

  const currencyBreakdownData = useMemo(() => {
    if (!summary?.byCurrency || Object.keys(summary.byCurrency).length === 0)
      return [];
    return Object.entries(summary.byCurrency).map(([key, value]) => ({
      id: key,
      currency: key.replace("budget_", "").replace("milestone_", ""),
      type: key.startsWith("budget") ? "Budget" : "Milestone",
      amount: value,
    }));
  }, [summary]);

  const tableData = useMemo(() => {
    const rows: { id: string; metric: string; value: string; numeric: number }[] = [
      { id: "1", metric: "Total Project Budget", value: (summary?.totalProjectBudget ?? 0).toLocaleString(), numeric: summary?.totalProjectBudget ?? 0 },
      { id: "2", metric: "Total Milestone Amount", value: (summary?.totalMilestoneAmount ?? 0).toLocaleString(), numeric: summary?.totalMilestoneAmount ?? 0 },
      { id: "3", metric: "Project Count", value: String(summary?.projectCount ?? 0), numeric: summary?.projectCount ?? 0 },
      { id: "4", metric: "Milestone Count", value: String(summary?.milestoneCount ?? 0), numeric: summary?.milestoneCount ?? 0 },
    ];
    currencyBreakdownData.forEach((row, i) => {
      rows.push({
        id: `curr-${i}`,
        metric: `${row.type} (${row.currency || "USD"})`,
        value: row.amount.toLocaleString(),
        numeric: row.amount,
      });
    });
    return rows;
  }, [summary, currencyBreakdownData]);

  const columns: Column<typeof tableData[0]>[] = [
    { key: "metric", header: "Metric", sortable: true },
    {
      key: "numeric",
      header: "Value",
      sortable: true,
      render: (item) => item.value,
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
        <h1 className="text-[1rem] font-[600] mb-2">Finance</h1>
        <p className="text-[0.875rem] opacity-60">
          Platform-wide financial overview
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<DollarSign size={20} />}
          title="Total Project Budget"
          value={(summary?.totalProjectBudget ?? 0).toLocaleString()}
        />
        <StatCard
          icon={<Layers size={20} />}
          title="Total Milestone Amount"
          value={(summary?.totalMilestoneAmount ?? 0).toLocaleString()}
        />
        <StatCard
          icon={<Briefcase size={20} />}
          title="Projects"
          value={String(summary?.projectCount ?? 0)}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Milestones"
          value={String(summary?.milestoneCount ?? 0)}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="Budget vs Milestone Amount"
          data={budgetVsMilestoneData}
          bars={[{ key: "Amount", label: "Amount" }]}
        />
        <BarChart
          title="Projects vs Milestones Count"
          data={countsData}
          bars={[{ key: "Count", label: "Count" }]}
        />
      </div>
      {currencyBreakdownData.length > 0 && (
        <div className="mb-8">
          <BarChart
            title="Breakdown by Currency"
            data={currencyBreakdownData.map((r) => ({
              name: `${r.type} ${r.currency || "USD"}`,
              Amount: r.amount,
            }))}
            bars={[{ key: "Amount", label: "Amount" }]}
          />
        </div>
      )}

      {/* Table */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Financial Summary</h2>
        <DataTable
          data={tableData}
          columns={columns}
          showCheckboxes={false}
          showActions={false}
          pageSize={10}
          emptyMessage="No data available"
        />
      </Card>
    </div>
  );
}
