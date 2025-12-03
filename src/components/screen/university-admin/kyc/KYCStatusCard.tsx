/**
 * KYC Status Card Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { OrganizationI } from "@/src/models/organization";
import { ShieldCheck, Clock } from "lucide-react";

export interface Props {
  organization: OrganizationI;
}

/**
 * Display KYC status for organization
 */
const KYCStatusCard = ({ organization }: Props) => {
  return (
    <Card title="Organization KYC Status">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-pale rounded-lg">
          <div className="flex items-center gap-4">
            <ShieldCheck size={32} className="text-primary" />
            <div>
              <p className="font-semibold text-lg">{organization.name}</p>
              <p className="text-sm text-secondary">
                Organization ID: {organization.id}
              </p>
            </div>
          </div>
          <StatusIndicator status={organization.kycStatus} />
        </div>

        {organization.kycStatus === "APPROVED" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-success-dark">
              <strong>✓ Approved</strong> - Your organization has been verified
              and approved.
            </p>
          </div>
        )}

        {organization.kycStatus === "PENDING" && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-warning-dark">
              <Clock className="inline mr-2" size={16} />
              <strong>Pending Review</strong> - Your KYC documents are under
              review by Super Admin.
            </p>
          </div>
        )}

        {organization.kycStatus === "REJECTED" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-error-dark">
              <strong>Rejected</strong> - Your KYC documents have been rejected.
              Please upload new documents.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default KYCStatusCard;









