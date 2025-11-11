/**
 * Organization Info Component
 * Displays organization information (KYC upload removed - payment gateway on hold)
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import StatusIndicator from "@/src/components/core/StatusIndicator";

export interface OrganizationInfo {
  name: string;
  type: string;
  kycStatus: string;
}

export interface Props {
  organizationInfo: OrganizationInfo | null;
}

/**
 * Organization information section
 * KYC document upload removed - payment gateway integration on hold
 */
const OrganizationInfo = ({ organizationInfo }: Props) => {
  if (!organizationInfo) {
    return null;
  }

  return (
    <Card title="Organization">
      <div className="space-y-3">
        <div>
          <p className="text-sm opacity-60 mb-1">Organization Name</p>
          <p className="font-semibold">{organizationInfo.name}</p>
        </div>
        <div>
          <p className="text-sm opacity-60 mb-1">Organization Type</p>
          <p className="font-semibold capitalize">{organizationInfo.type}</p>
        </div>
        <div>
          <p className="text-sm opacity-60 mb-1">KYC Status</p>
          <StatusIndicator status={organizationInfo.kycStatus} />
        </div>
      </div>
    </Card>
  );
};

export default OrganizationInfo;




