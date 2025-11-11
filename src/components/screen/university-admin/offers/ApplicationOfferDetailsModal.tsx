/**
 * Application Offer Details Modal - Side panel for viewing application details with user avatars
 */
"use client";

import React, { useState } from "react";
import SideModal from "@/src/components/base/SideModal";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import { GroupI } from "@/src/models/group";
import { Calendar, User, Users, Send, Briefcase, Star, FileText } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";
import { getInitials, hasAvatar } from "@/src/utils/avatarUtils";

export interface Props {
  open: boolean;
  onClose: () => void;
  application: ApplicationI | null;
  project?: ProjectI;
  students?: UserI[];
  group?: GroupI;
  onIssueOffer?: (application: ApplicationI) => void;
}

/**
 * Side modal for application offer details with user avatars
 */
const ApplicationOfferDetailsModal = ({
  open,
  onClose,
  application,
  project,
  students = [],
  group,
  onIssueOffer,
}: Props) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  if (!application) return null;

  const handleImageError = (userId: string) => {
    setFailedImages((prev) => new Set(prev).add(userId));
  };

  const canIssueOffer = application.status === "SHORTLISTED";
  const isOffered = application.status === "OFFERED";
  const isAccepted = application.status === "ACCEPTED";
  const isAssigned = application.status === "ASSIGNED";

  const renderAvatar = (user: UserI, index: number = 0) => {
    const avatarUrl = user.profile?.avatar;
    const hasImage = hasAvatar(avatarUrl) && !failedImages.has(user.id);
    const initials = getInitials(user.name);

    return (
      <div
        key={user.id}
        className={`relative ${index > 0 ? "-ml-3" : ""}`}
        style={{
          zIndex: students.length - index,
        }}
      >
        {hasImage ? (
          <img
            src={avatarUrl}
            alt={user.name}
            className="h-12 w-12 border-2 border-pale rounded-full object-cover"
            onError={() => handleImageError(user.id)}
          />
        ) : (
          <div className="h-12 w-12 border-2 border-pale rounded-full flex items-center justify-center bg-pale-primary">
            <span className="text-primary font-semibold text-sm">
              {initials}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Application Details"
      width="600px"
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-pale-primary rounded-lg">
            {application.applicantType === "GROUP" ? (
              <Users size={32} className="text-primary" />
            ) : (
              <User size={32} className="text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-[1.125rem] font-[600] mb-1">
              {project?.title || `Project ${application.projectId}`}
            </h3>
            <div className="flex items-center gap-2">
              <StatusIndicator status={application.status} />
              <span className="text-[0.8125rem] opacity-60 capitalize">
                {application.applicantType.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Project Information */}
          {project && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Project</p>
              </div>
              <p className="text-[0.875rem] opacity-60">{project.description}</p>
            </div>
          )}

          {/* Applicant Information */}
          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              {application.applicantType === "GROUP" ? (
                <Users size={16} className="opacity-60" />
              ) : (
                <User size={16} className="opacity-60" />
              )}
              <p className="text-[0.875rem] font-medium">
                {application.applicantType === "GROUP" ? "Group Members" : "Applicant"}
              </p>
            </div>
            {application.applicantType === "GROUP" && group ? (
              <div>
                <p className="text-[0.875rem] font-medium mb-2">{group.name}</p>
                <div className="flex items-center gap-2 mb-3">
                  {students.map((student, index) => renderAvatar(student, index))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {students.map((student) => (
                    <span
                      key={student.id}
                      className="text-[0.75rem] px-2 py-1 rounded-full bg-pale-primary text-primary"
                    >
                      {student.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {students.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      {renderAvatar(students[0])}
                    </div>
                    <p className="text-[0.875rem] font-medium">{students[0].name}</p>
                    <p className="text-[0.8125rem] opacity-60">{students[0].email}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Application Statement */}
          {application.statement && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Application Statement</p>
              </div>
              <p className="text-[0.875rem] opacity-60">{application.statement}</p>
            </div>
          )}

          {/* Offer Expiry Info */}
          {isOffered && application.offerExpiresAt && (
            <div className="p-4 bg-pale-primary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Offer Expires</p>
              </div>
              <p className="text-[0.875rem] font-medium">
                {formatDateShort(application.offerExpiresAt)}
              </p>
            </div>
          )}

          {/* Score Information */}
          {application.score && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Score</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[0.8125rem]">
                <div>
                  <p className="opacity-60 mb-1">Final Score</p>
                  <p className="font-medium">{application.score.finalScore}%</p>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Auto Score</p>
                  <p className="font-medium">{application.score.autoScore}%</p>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Portfolio</p>
                  <p className="font-medium">{application.score.portfolioScore}%</p>
                </div>
                <div>
                  <p className="opacity-60 mb-1">Skill Match</p>
                  <p className="font-medium">{application.score.skillMatch}%</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Created Date</p>
            </div>
            <p className="text-[0.875rem] opacity-60">
              {formatDateShort(application.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-custom">
          {canIssueOffer && onIssueOffer && (
            <Button
              onClick={() => {
                onIssueOffer(application);
                onClose();
              }}
              className="bg-primary w-full"
            >
              <Send size={16} className="mr-2" />
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
      </div>
    </SideModal>
  );
};

export default ApplicationOfferDetailsModal;

