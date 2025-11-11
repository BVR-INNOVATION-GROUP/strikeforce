/**
 * Organization Card Component
 * Benchmarked from GroupCard.tsx - displays organization with status, actions, and details
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { OrganizationI } from "@/src/models/organization";
import { Building2, GraduationCap, CheckCircle2, XCircle, Eye, Calendar, Mail, Globe, Trash2, Edit } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";

export interface Props {
  organization: OrganizationI;
  onApprove: (orgId: number) => void;
  onReject: (orgId: number) => void;
  onDeapprove?: (orgId: number) => void;
  onDelete?: (orgId: number) => void;
  onEdit?: (orgId: number) => void;
  onViewDetails: (orgId: number) => void;
  approving?: number | null;
}

/**
 * Display a single organization card with enhanced UI
 * Features status indicators, actions, and organization information
 */
const OrganizationCard = ({ 
  organization, 
  onApprove, 
  onReject,
  onDeapprove,
  onDelete,
  onEdit,
  onViewDetails,
  approving 
}: Props) => {
  const isPartner = organization.type === "PARTNER";
  const isPending = organization.kycStatus === "PENDING";
  const isApproved = organization.kycStatus === "APPROVED";
  const isRejected = organization.kycStatus === "REJECTED";
  const isProcessing = approving === organization.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200"
    >
      {/* Header with organization name and type */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-3 rounded-lg ${isPartner ? "bg-pale-primary" : "bg-pale"}`}>
            {isPartner ? (
              <Building2 size={24} className="text-primary" />
            ) : (
              <GraduationCap size={24} className="text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-[1rem] font-[600] mb-1">{organization.name}</h3>
            <div className="flex items-center gap-2">
              <StatusIndicator
                status={organization.type.toLowerCase()}
                label={organization.type}
              />
              <StatusIndicator status={organization.kycStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Organization details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[0.875rem] opacity-60">
          <Mail size={14} />
          <span>{organization.email}</span>
        </div>
        {organization.billingProfile?.website && (
          <div className="flex items-center gap-2 text-[0.875rem] opacity-60">
            <Globe size={14} />
            <a 
              href={organization.billingProfile.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary hover:underline"
            >
              {organization.billingProfile.website}
            </a>
          </div>
        )}
        <div className="flex items-center gap-2 text-[0.75rem] opacity-50">
          <Calendar size={12} />
          <span>Created {formatDateShort(organization.createdAt)}</span>
        </div>
      </div>

      {/* Billing profile info */}
      {organization.billingProfile && (
        <div className="mb-4 p-3 bg-pale rounded-lg">
          <p className="text-[0.8125rem] opacity-60 mb-1">Contact</p>
          <p className="text-[0.875rem] font-medium">
            {organization.billingProfile.contactName || "N/A"}
          </p>
          {organization.billingProfile.phone && (
            <p className="text-[0.8125rem] opacity-60 mt-1">
              {organization.billingProfile.phone}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => onViewDetails(organization.id)}
          className="bg-pale text-primary flex-1 text-[0.875rem] py-2.5"
        >
          <Eye size={14} className="mr-1" />
          View Details
        </Button>
        {onEdit && (
          <Button
            onClick={() => onEdit(organization.id)}
            className="bg-pale text-primary text-[0.875rem] px-4 py-2.5 flex items-center gap-1"
            disabled={isProcessing}
          >
            <Edit size={14} />
            Edit
          </Button>
        )}
        {isPending && (
          <>
            <Button
              onClick={() => onReject(organization.id)}
              className="bg-pale text-primary text-[0.875rem] px-4 py-2.5 flex items-center gap-1"
              disabled={isProcessing}
            >
              <XCircle size={14} />
              Reject
            </Button>
            <Button
              onClick={() => onApprove(organization.id)}
              className="bg-primary text-white text-[0.875rem] px-4 py-2.5 flex items-center gap-1"
              disabled={isProcessing}
            >
              <CheckCircle2 size={14} />
              {isProcessing ? "Processing..." : "Approve"}
            </Button>
          </>
        )}
        {isRejected && (
          <Button
            onClick={() => onApprove(organization.id)}
            className="bg-primary text-white flex-1 text-[0.875rem] py-2.5"
            disabled={isProcessing}
          >
            <CheckCircle2 size={14} className="mr-1" />
            {isProcessing ? "Processing..." : "Approve"}
          </Button>
        )}
        {isApproved && onDeapprove && (
          <Button
            onClick={() => onDeapprove(organization.id)}
            className="bg-pale text-primary text-[0.875rem] px-4 py-2.5 flex items-center gap-1"
            disabled={isProcessing}
          >
            <XCircle size={14} />
            Deapprove
          </Button>
        )}
        {onDelete && (
          <Button
            onClick={() => onDelete(organization.id)}
            className="bg-pale text-primary text-[0.875rem] px-4 py-2.5 flex items-center gap-1"
            disabled={isProcessing}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default OrganizationCard;

