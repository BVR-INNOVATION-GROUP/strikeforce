/**
 * Offer Statistics Cards - uses StatCard component for consistent theming
 */
"use client";

import React from "react";
import StatCard from "@/src/components/core/StatCard";
import { Clock, Send, CheckCircle } from "lucide-react";
import { ApplicationI } from "@/src/models/application";

export interface Props {
  applications: ApplicationI[];
}

/**
 * Display statistics for offers using StatCard components
 */
const OfferStatsCards = ({ applications }: Props) => {
  const shortlisted = applications.filter((a) => a.status === "SHORTLISTED");
  const offered = applications.filter((a) => a.status === "OFFERED");
  const accepted = applications.filter((a) => a.status === "ACCEPTED");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={<Clock size={20} />}
        title="Shortlisted"
        value={shortlisted.length}
      />
      <StatCard
        icon={<Send size={20} />}
        title="Offers Sent"
        value={offered.length}
      />
      <StatCard
        icon={<CheckCircle size={20} />}
        title="Accepted"
        value={accepted.length}
      />
    </div>
  );
};

export default OfferStatsCards;


