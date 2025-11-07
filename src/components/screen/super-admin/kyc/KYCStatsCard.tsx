/**
 * KYC Stats Card Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import { ShieldCheck } from "lucide-react";

export interface Props {
  pendingCount: number;
}

/**
 * Display pending KYC approvals count
 */
const KYCStatsCard = ({ pendingCount }: Props) => {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <ShieldCheck size={32} className="text-warning" />
        <div>
          <p className="text-sm text-secondary">Pending Approvals</p>
          <p className="text-3xl font-bold">{pendingCount}</p>
        </div>
      </div>
    </Card>
  );
};

export default KYCStatsCard;






