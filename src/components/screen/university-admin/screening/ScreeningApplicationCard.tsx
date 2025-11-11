/**
 * ScreeningApplicationCard - displays application information in card format for screening
 * Shows project, applicant type, status, scores, and scoring actions
 */
"use client";

import React from "react";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { Star, User, Users, Calendar } from "lucide-react";

export interface Props {
  application: ApplicationI;
  project: ProjectI | undefined;
  onScore?: (application: ApplicationI) => void;
  onViewDetails?: (application: ApplicationI) => void;
  onShortlist?: (application: ApplicationI) => void;
  onReject?: (application: ApplicationI) => void;
  onWaitlist?: (application: ApplicationI) => void;
}

/**
 * Format date to readable string
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ScreeningApplicationCard = ({ application, project, onScore, onViewDetails, onShortlist, onReject, onWaitlist }: Props) => {
  const hasScore = !!application.score;
  const finalScore = application.score?.finalScore || 0;
  const autoScore = application.score?.autoScore || 0;

  return (
    <div 
      className="bg-paper rounded-lg shadow-custom p-6 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onViewDetails?.(application)}
    >
      <div className="flex flex-col gap-4">
        {/* Header: Project and Status */}
        <div className="flex items-start justify-between">
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
            <span>{formatDate(application.createdAt)}</span>
          </div>
        </div>

        {/* Applicant Type */}
        <div className="flex items-center gap-2">
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

        {/* Score Section */}
        <div className="border-t border-custom pt-4">
          {hasScore ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-warning fill-warning" />
                <span className="text-[1rem] font-[600]">{finalScore}</span>
                <span className="text-[0.8125rem] opacity-60">
                  (Auto: {autoScore})
                </span>
              </div>
              {application.score && (
                <div className="grid grid-cols-2 gap-3 text-[0.8125rem]">
                  <div>
                    <p className="opacity-60 mb-1">Portfolio</p>
                    <p className="font-medium">
                      {application.score.portfolioScore}%
                    </p>
                  </div>
                  <div>
                    <p className="opacity-60 mb-1">Skill Match</p>
                    <p className="font-medium">
                      {application.score.skillMatch}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[0.875rem] opacity-60">Not scored yet</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-custom" onClick={(e) => e.stopPropagation()}>
          {/* Core Screening Actions */}
          <div className="flex gap-2">
            {onShortlist && application.status === "SUBMITTED" && (
              <Button
                onClick={() => onShortlist(application)}
                className="bg-primary text-[0.8125rem] py-2 px-3 flex-1"
              >
                Shortlist
              </Button>
            )}
            {onReject && (application.status === "SUBMITTED" || application.status === "SHORTLISTED") && (
              <Button
                onClick={() => onReject(application)}
                className="bg-pale text-primary text-[0.8125rem] py-2 px-3 flex-1"
              >
                Reject
              </Button>
            )}
            {onWaitlist && (application.status === "SUBMITTED" || application.status === "SHORTLISTED") && (
              <Button
                onClick={() => onWaitlist(application)}
                className="bg-pale text-primary text-[0.8125rem] py-2 px-3 flex-1"
              >
                Waitlist
              </Button>
            )}
          </div>
          {/* Optional Scoring Action (Advisory) */}
          {onScore && (
            <Button
              onClick={() => onScore(application)}
              className="bg-pale text-primary text-[0.8125rem] py-2 px-4 w-full"
            >
              {hasScore ? "Update Score" : "Add Score (Advisory)"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreeningApplicationCard;

