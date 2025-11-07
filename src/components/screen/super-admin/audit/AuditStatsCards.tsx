/**
 * Audit Stats Cards Component
 */
"use client";

import React from "react";
import StatCard from "@/src/components/core/StatCard";
import { BarChart3, ShieldCheck, DollarSign, AlertCircle } from "lucide-react";

export interface Props {
  stats: {
    totalEvents: number;
    kycEvents: number;
    financialEvents: number;
    disputeEvents: number;
  };
}

/**
 * Display audit statistics cards
 */
const AuditStatsCards = ({ stats }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={<BarChart3 size={20} />} title="Total Events" value={stats.totalEvents} />
      <StatCard icon={<ShieldCheck size={20} />} title="KYC Events" value={stats.kycEvents} />
      <StatCard
        icon={<DollarSign size={20} />}
        title="Financial Events"
        value={stats.financialEvents}
      />
      <StatCard
        icon={<AlertCircle size={20} />}
        title="Dispute Events"
        value={stats.disputeEvents}
      />
    </div>
  );
};

export default AuditStatsCards;






