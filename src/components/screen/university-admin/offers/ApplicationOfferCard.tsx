/**
 * Application Offer Card Component - displays application information in card format for offers
 * Benchmarked from GroupCard.tsx
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { Calendar, User, Users, Send } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";

export interface Props {
  application: ApplicationI;
  project: ProjectI | undefined;
  onIssueOffer: (application: ApplicationI) => void;
  onViewDetails?: (application: ApplicationI) => void;
}

/**
 * Display a single application card for offers page
 */
const ApplicationOfferCard = ({ application, project, onIssueOffer, onViewDetails }: Props) => {
  const canIssueOffer = application.status === "SHORTLISTED";
  const isOffered = application.status === "OFFERED";
  const isAccepted = application.status === "ACCEPTED";
  const isAssigned = application.status === "ASSIGNED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails?.(application)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-[1rem] font-[600] mb-2">
            {project?.title || `Project ${application.projectId}`}
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <StatusIndicator status={application.status} />
            <span className="text-[0.8125rem] opacity-60 capitalize">
              {application.applicantType.toLowerCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[0.8125rem] opacity-60">
          <Calendar size={14} />
          <span>{formatDateShort(application.createdAt)}</span>
        </div>
      </div>

      {/* Applicant Type */}
      <div className="flex items-center gap-2 mb-4">
        {application.applicantType === "GROUP" ? (
          <Users size={16} className="opacity-60" />
        ) : (
          <User size={16} className="opacity-60" />
        )}
        <span className="text-[0.875rem] opacity-60">
          {application.applicantType === "GROUP"
            ? `Group Application`
            : `Individual Application`}
        </span>
      </div>

      {/* Offer Expiry Info */}
      {isOffered && application.offerExpiresAt && (
        <div className="mb-4 p-3 bg-pale-primary rounded-lg">
          <p className="text-[0.8125rem] opacity-60 mb-1">Offer Expires</p>
          <p className="text-[0.875rem] font-medium">
            {formatDateShort(application.offerExpiresAt)}
          </p>
        </div>
      )}

      {/* Footer with actions */}
      <div className="pt-4 border-t border-custom" onClick={(e) => e.stopPropagation()}>
        {canIssueOffer && (
          <Button
            onClick={() => onIssueOffer(application)}
            className="bg-primary w-full text-[0.875rem] py-2.5"
          >
            <Send size={14} className="mr-1" />
            Issue Offer
          </Button>
        )}
        {isOffered && (
          <p className="text-[0.8125rem] opacity-60 text-center">
            Offer sent - waiting for response
          </p>
        )}
        {isAccepted && (
          <p className="text-[0.8125rem] text-success text-center font-medium">
            Offer accepted
          </p>
        )}
        {isAssigned && (
          <p className="text-[0.8125rem] text-success text-center font-medium">
            Assigned to project
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ApplicationOfferCard;

