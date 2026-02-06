"use client";

import React, { useEffect, useState, useMemo } from "react";
import StatCard from "@/src/components/core/StatCard";
import Card from "@/src/components/core/Card";
import DataTable from "@/src/components/base/DataTable";
import { Column } from "@/src/components/base/DataTable";
import Select from "@/src/components/core/Select";
import { OptionI } from "@/src/components/core/Select";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { adminRepository } from "@/src/repositories/adminRepository";
import { OrganizationI } from "@/src/models/organization";
import { useToast } from "@/src/hooks/useToast";
import BarChart from "@/src/components/base/BarChart";
import LineChart from "@/src/components/base/LineChart";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { Building2, GraduationCap, ShieldCheck, Clock, Filter, HardDrive } from "lucide-react";
import Skeleton from "@/src/components/core/Skeleton";
import { useRouter } from "next/navigation";

/**
 * Super Admin Dashboard - Approve partner and university admin requests
 * PRD Reference: Section 4 - Super Admin approves organizations
 */
export default function SuperAdminDashboard() {
  const { showError } = useToast();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [storageUsage, setStorageUsage] = useState<{ configured: boolean; storage: number; bandwidth: number; resources: number } | null>(null);

  /**
   * Fetch organizations data
   */
  const fetchOrganizations = async () => {
    try {
      const orgs = await organizationRepository.getAll();
      setOrganizations(orgs);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      showError("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageUsage = async () => {
    try {
      const data = await adminRepository.getStorageUsage();
      setStorageUsage(data);
    } catch {
      setStorageUsage({ configured: false, storage: 0, bandwidth: 0, resources: 0 });
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchStorageUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const pending = organizations.filter((o) => o.kycStatus === "PENDING");
    const approved = organizations.filter((o) => o.kycStatus === "APPROVED");
    const rejected = organizations.filter((o) => o.kycStatus === "REJECTED");
    const partners = organizations.filter((o) => o.type === "PARTNER");
    const universities = organizations.filter((o) => o.type === "UNIVERSITY");
    
    return {
      pendingRequests: pending.length,
      approvedOrganizations: approved.length,
      rejectedOrganizations: rejected.length,
      totalPartners: partners.length,
      totalUniversities: universities.length,
      totalOrganizations: organizations.length,
    };
  }, [organizations]);


  // Chart data - KYC status distribution
  const kycStatusData = useMemo(() => {
    return [
      { name: "Pending", "Organizations": stats.pendingRequests },
      { name: "Approved", "Organizations": stats.approvedOrganizations },
      { name: "Rejected", "Organizations": stats.rejectedOrganizations },
    ];
  }, [stats]);

  // Chart data - Organization type distribution
  const orgTypeData = useMemo(() => {
    return [
      { name: "Partners", "Count": stats.totalPartners },
      { name: "Universities", "Count": stats.totalUniversities },
    ];
  }, [stats]);

  const typeOptions: OptionI[] = [
    { label: "All types", value: "" },
    { label: "Partner", value: "PARTNER" },
    { label: "University", value: "UNIVERSITY" },
  ];

  const statusOptions: OptionI[] = [
    { label: "All statuses", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  const filteredOrgs = useMemo(() => {
    let list = [...organizations];
    if (typeFilter) list = list.filter((o) => o.type === typeFilter);
    if (statusFilter) list = list.filter((o) => o.kycStatus === statusFilter);
    return list;
  }, [organizations, typeFilter, statusFilter]);

  const tableData = useMemo(
    () =>
      filteredOrgs.map((o) => ({
        id: String(o.id),
        orgId: o.id,
        name: o.name,
        type: o.type,
        status: o.kycStatus,
        createdAt: o.createdAt,
      })),
    [filteredOrgs]
  );

  const columns: Column<typeof tableData[0]>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (item) => <StatusIndicator status={item.type.toLowerCase()} label={item.type} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => <StatusIndicator status={item.status} />,
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  // Chart data - Registrations over time (last 6 months)
  const registrationTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const now = new Date();
    
    return months.map((month, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthStart = monthDate.toISOString();
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString();
      
      const count = organizations.filter((org) => {
        const created = new Date(org.createdAt);
        return created >= new Date(monthStart) && created <= new Date(monthEnd);
      }).length;
      
      return {
        name: month,
        "Registrations": count,
      };
    });
  }, [organizations]);

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-full">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 mb-8">
          <Skeleton width={200} height={24} rounded="md" className="mb-2" />
          <Skeleton width={300} height={16} rounded="md" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-paper rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton width={24} height={24} rounded="md" />
                <Skeleton width={120} height={16} rounded="md" />
              </div>
              <Skeleton width={80} height={32} rounded="md" />
            </div>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-paper rounded-lg p-6">
              <Skeleton width={200} height={24} rounded="md" className="mb-4" />
              <Skeleton width="100%" height={300} rounded="md" />
            </div>
          ))}
        </div>

        {/* Line Chart Skeleton */}
        <div className="bg-paper rounded-lg p-6">
          <Skeleton width={300} height={24} rounded="md" className="mb-4" />
          <Skeleton width="100%" height={300} rounded="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Dashboard</h1>
        <p className="text-[0.875rem] opacity-60">
          System-wide overview and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Building2 size={20} />}
          title="Total Partners"
          value={stats.totalPartners}
        />
        <StatCard
          icon={<GraduationCap size={20} />}
          title="Total Universities"
          value={stats.totalUniversities}
        />
        <StatCard
          icon={<ShieldCheck size={20} />}
          title="Approved"
          value={stats.approvedOrganizations}
        />
        <StatCard
          icon={<Clock size={20} />}
          title="Pending Requests"
          value={stats.pendingRequests}
        />
      </div>

      {/* Storage Widget */}
      {storageUsage && (
        <Card className="p-4 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive size={20} />
            <span className="text-sm font-semibold">Cloudinary Storage</span>
          </div>
          {storageUsage.configured ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-secondary">Storage</p>
                <p className="text-lg font-semibold">{(storageUsage.storage / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Bandwidth</p>
                <p className="text-lg font-semibold">{(storageUsage.bandwidth / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Resources</p>
                <p className="text-lg font-semibold">{storageUsage.resources.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-secondary">Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.</p>
          )}
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="KYC Status Distribution"
          data={kycStatusData}
          bars={[
            { key: "Organizations", label: "Organizations" },
          ]}
        />
        <BarChart
          title="Organization Types"
          data={orgTypeData}
          bars={[
            { key: "Count", label: "Count" },
          ]}
        />
      </div>

      {/* Registration Trend Chart */}
      <div className="mb-8">
        <LineChart
          title="Organization Registrations Over Time"
          data={registrationTrendData}
          lines={[
            { key: "Registrations", label: "Registrations" },
          ]}
        />
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[160px]">
            <Select
              title="Type"
              options={typeOptions}
              value={typeFilter}
              onChange={(opt) => setTypeFilter(String(typeof opt === "object" ? (opt as OptionI).value : opt))}
              placeHolder="All types"
            />
          </div>
          <div className="min-w-[160px]">
            <Select
              title="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(opt) => setStatusFilter(String(typeof opt === "object" ? (opt as OptionI).value : opt))}
              placeHolder="All statuses"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Organizations</h2>
        <DataTable
          data={tableData}
          columns={columns}
          showCheckboxes={false}
          showActions={false}
          pageSize={10}
          emptyMessage="No organizations found"
          onRowClick={(row) => {
            if (row.type === "PARTNER") router.push(`/super-admin/partners/${row.orgId}`);
            else router.push(`/super-admin/universities/${row.orgId}`);
          }}
        />
      </Card>
    </div>
  );
}
