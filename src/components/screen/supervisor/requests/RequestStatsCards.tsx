/**
 * Request Stats Cards Component
 */
"use client";

import React from "react";
import StatCard from "@/src/components/core/StatCard";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { SupervisorRequestI } from "@/src/models/supervisor";

export interface Props {
  requests: SupervisorRequestI[];
}

/**
 * Display request statistics
 */
const RequestStatsCards = ({ requests }: Props) => {
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const denied = requests.filter((r) => r.status === "DENIED").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard icon={<Clock size={20} />} title="Pending" value={pending} />
      <StatCard
        icon={<CheckCircle size={20} />}
        title="Approved"
        value={approved}
      />
      <StatCard icon={<XCircle size={20} />} title="Denied" value={denied} />
    </div>
  );
};

export default RequestStatsCards;









