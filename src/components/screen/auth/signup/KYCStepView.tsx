/**
 * KYC Step View Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import KYCDocumentUpload from "@/src/components/screen/kyc/KYCDocumentUpload";
import { FileText } from "lucide-react";

export interface Props {
  orgId: string;
  isUniversity?: boolean;
  onKYCSubmit: (documentData: unknown) => Promise<void>;
}

/**
 * Display KYC upload step after organization registration
 */
const KYCStepView = ({ orgId, isUniversity = false, onKYCSubmit }: Props) => {
  const [isKYCModalOpen, setIsKYCModalOpen] = React.useState(false);
  const orgType = isUniversity ? "University" : "Partner";

  return (
    <div className="flex items-center justify-center min-h-screen bg-pale">
      <Card className="max-w-2xl w-full">
        <div className="mb-6">
          <FileText size={48} className="mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-center mb-2">
            {orgType} Registration Successful!
          </h2>
          <p className="text-secondary text-center">
            Please upload KYC documents to complete your registration.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-pale-primary p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Required Documents:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-secondary">
              <li>Certificate of Incorporation</li>
              <li>Business License</li>
              <li>Tax Document</li>
            </ul>
          </div>

          <Button
            onClick={() => setIsKYCModalOpen(true)}
            className="bg-primary w-full"
          >
            Upload KYC Documents
          </Button>

          <p className="text-xs text-center text-muted">
            Your account will be activated after Super Admin approval (2-3
            business days).
          </p>
        </div>

        <KYCDocumentUpload
          open={isKYCModalOpen}
          orgId={orgId}
          onClose={() => setIsKYCModalOpen(false)}
          onSubmit={onKYCSubmit}
        />
      </Card>
    </div>
  );
};

export default KYCStepView;






