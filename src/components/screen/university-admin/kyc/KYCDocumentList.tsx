/**
 * KYC Document List Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { KycDocumentI } from "@/src/models/kyc";
import { OrganizationI } from "@/src/models/organization";
import { FileText, Plus } from "lucide-react";

export interface Props {
  organization: OrganizationI;
  documents: KycDocumentI[];
  onUpload: () => void;
}

/**
 * Display list of KYC documents
 */
const KYCDocumentList = ({ organization, documents, onUpload }: Props) => {
  return (
    <Card
      title="KYC Documents"
      actions={
        organization.kycStatus !== "APPROVED" && (
          <Button onClick={onUpload} className="bg-primary text-sm">
            <Plus size={14} className="mr-1" />
            Upload Document
          </Button>
        )
      }
    >
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-pale rounded-lg"
          >
            <div className="flex items-center gap-4">
              <FileText size={24} className="text-muted-light" />
              <div>
                <p className="font-semibold capitalize">
                  {doc.type.replace("_", " ").toLowerCase()}
                </p>
                <p className="text-sm text-secondary">
                  Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                </p>
                {doc.reviewedAt && (
                  <p className="text-sm text-secondary">
                    Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StatusIndicator status={doc.status} />
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                View Document
              </a>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <p className="text-center text-muted py-8">
            No KYC documents uploaded
          </p>
        )}
      </div>
    </Card>
  );
};

export default KYCDocumentList;









