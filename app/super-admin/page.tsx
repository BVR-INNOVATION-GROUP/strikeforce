"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import DataTable from "@/src/components/base/DataTable";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import Button from "@/src/components/core/Button";
import LineChart from "@/src/components/base/LineChart";
import BarChart from "@/src/components/base/BarChart";
import { OrganizationI } from "@/src/models/organization";
import { dashboardService, SuperAdminDashboardStats } from "@/src/services/dashboardService";
import { Column } from "@/src/components/base/DataTable";
import { ShieldCheck, AlertTriangle, BarChart3 } from "lucide-react";

/**
 * Super Admin Dashboard - overview of KYC approvals and platform-wide metrics
 */
export default function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [stats, setStats] = useState<SuperAdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orgData, dashboardStats] = await Promise.all([
          import("@/src/data/mockOrganizations.json"),
          dashboardService.getSuperAdminDashboardStats(),
        ]);
        setOrganizations(orgData.default as OrganizationI[]);
        setStats(dashboardStats);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Chart data - organizations over time
  const orgTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthOrgs = organizations.filter((org) => {
        const created = new Date(org.createdAt).getMonth();
        return created <= index;
      });
      return {
        name: month,
        "Total Organizations": monthOrgs.length,
        "Approved": monthOrgs.filter((o) => o.kycStatus === "APPROVED").length,
      };
    });
  }, [organizations]);

  // Chart data - organizations by status
  const orgsByStatusData = useMemo(() => {
    const statusMap = organizations.reduce((acc, org) => {
      acc[org.kycStatus] = (acc[org.kycStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusMap).map(([name, count]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      "Organizations": count,
    }));
  }, [organizations]);

  const handleApproveKYC = (orgId: string) => {
    // In production, call API to approve KYC
    setOrganizations(
      organizations.map((org) =>
        org.id === orgId ? { ...org, kycStatus: "APPROVED" } : org
      )
    );
  };

  const columns: Column<OrganizationI>[] = [
    {
      key: "name",
      header: "Organization",
    },
    {
      key: "type",
      header: "Type",
      render: (item) => (
        <StatusIndicator
          status={item.type.toLowerCase()}
          label={item.type}
        />
      ),
    },
    {
      key: "kycStatus",
      header: "KYC Status",
      render: (item) => <StatusIndicator status={item.kycStatus} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) =>
        item.kycStatus === "PENDING" ? (
          <Button
            onClick={() => handleApproveKYC(item.id)}
            className="bg-primary text-white text-xs px-3 py-1"
          >
            Approve
          </Button>
        ) : null,
    },
  ];

  const pendingKYC = organizations.filter((o) => o.kycStatus === "PENDING");

  if (loading || !stats) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Super Admin Platform Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<ShieldCheck size={20} />}
          title="Pending KYC"
          value={stats.pendingKYC}
          change={stats.pendingKYCChange}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Active Disputes"
          value={stats.activeDisputes}
          change={stats.activeDisputesChange}
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          title="Total Organizations"
          value={stats.totalOrganizations}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Organization Trends"
          data={orgTrendData}
          lines={[
            { key: "Total Organizations", label: "Total Organizations" },
            { key: "Approved", label: "Approved" },
          ]}
        />
        <BarChart
          title="Organizations by KYC Status"
          data={orgsByStatusData}
          bars={[
            { key: "Organizations", label: "Organizations" },
          ]}
        />
      </div>

      {/* KYC Approvals */}
      <Card title="KYC Approvals">
        <DataTable
          data={organizations}
          columns={columns}
          emptyMessage="No organizations pending approval"
        />
      </Card>
    </div>
  );
}

