/**
 * Supervisor Stats Cards Component
 */
"use client";

import React from "react";
import StatCard from "@/src/components/core/StatCard";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { SupervisorRequestI } from "@/src/models/supervisor";

export interface Props {
  requests: SupervisorRequestI[];
}

/**
 * Display supervisor statistics cards
 */
const SupervisorStatsCards = ({ requests }: Props) => {
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const approvedRequests = requests.filter((r) => r.status === "APPROVED");
  const deniedRequests = requests.filter((r) => r.status === "DENIED");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={<AlertCircle size={20} />}
        title="Pending Requests"
        value={pendingRequests.length}
      />
      <StatCard
        icon={<CheckCircle size={20} />}
        title="Approved"
        value={approvedRequests.length}
      />
      <StatCard
        icon={<XCircle size={20} />}
        title="Denied"
        value={deniedRequests.length}
      />
    </div>
  );
};

export default SupervisorStatsCards;





