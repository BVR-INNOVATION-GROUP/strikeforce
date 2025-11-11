"use client";

import React, { useEffect, useState, useMemo } from "react";
import StatCard from "@/src/components/core/StatCard";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { OrganizationI } from "@/src/models/organization";
import { useToast } from "@/src/hooks/useToast";
import BarChart from "@/src/components/base/BarChart";
import LineChart from "@/src/components/base/LineChart";
import { Building2, GraduationCap, ShieldCheck, Clock } from "lucide-react";

/**
 * Super Admin Dashboard - Approve partner and university admin requests
 * PRD Reference: Section 4 - Super Admin approves organizations
 */
export default function SuperAdminDashboard() {
  const { showError } = useToast();
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchOrganizations();
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
        <div className="flex items-center justify-center h-full">
          <p className="text-[0.875rem] opacity-60">Loading...</p>
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
      <div>
        <LineChart
          title="Organization Registrations Over Time"
          data={registrationTrendData}
          lines={[
            { key: "Registrations", label: "Registrations" },
          ]}
        />
      </div>
    </div>
  );
}
