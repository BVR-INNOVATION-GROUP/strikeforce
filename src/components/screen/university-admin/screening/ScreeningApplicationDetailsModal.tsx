/**
 * Screening Application Details Modal - Side panel for viewing application details with user avatars
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
import { Calendar, User, Users, Star, Briefcase, FileText } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";
import { getInitials, hasAvatar } from "@/src/utils/avatarUtils";

export interface Props {
  open: boolean;
  onClose: () => void;
  application: ApplicationI | null;
  project?: ProjectI;
  students?: UserI[];
  group?: GroupI;
  onScore: (application: ApplicationI) => void;
}

/**
 * Side modal for screening application details with user avatars
 */
const ScreeningApplicationDetailsModal = ({
  open,
  onClose,
  application,
  project,
  students = [],
  group,
  onScore,
}: Props) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  if (!application) return null;

  const handleImageError = (userId: string) => {
    setFailedImages((prev) => new Set(prev).add(userId));
  };

  const hasScore = !!application.score;
  const finalScore = application.score?.finalScore || 0;

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

          {/* Score Information */}
          {hasScore && application.score ? (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Star size={16} className="text-warning fill-warning" />
                <p className="text-[0.875rem] font-medium">Scoring Details</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[1rem] font-[600]">{finalScore}%</span>
                  <span className="text-[0.8125rem] opacity-60">
                    (Auto: {application.score.autoScore}%)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[0.8125rem]">
                  <div>
                    <p className="opacity-60 mb-1">Portfolio Score</p>
                    <p className="font-medium">{application.score.portfolioScore}%</p>
                  </div>
                  <div>
                    <p className="opacity-60 mb-1">Skill Match</p>
                    <p className="font-medium">{application.score.skillMatch}%</p>
                  </div>
                  <div>
                    <p className="opacity-60 mb-1">Rating Score</p>
                    <p className="font-medium">{application.score.ratingScore}%</p>
                  </div>
                  <div>
                    <p className="opacity-60 mb-1">On-Time Rate</p>
                    <p className="font-medium">
                      {(application.score.onTimeRate * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="opacity-60 mb-1">Rework Rate</p>
                    <p className="font-medium">
                      {(application.score.reworkRate * 100).toFixed(0)}%
                    </p>
                  </div>
                  {application.score.manualSupervisorScore && (
                    <div>
                      <p className="opacity-60 mb-1">Manual Supervisor Score</p>
                      <p className="font-medium">
                        {application.score.manualSupervisorScore}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-pale rounded-lg">
              <p className="text-[0.875rem] opacity-60">Not scored yet</p>
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
          <Button
            onClick={() => {
              onScore(application);
              onClose();
            }}
            className="bg-primary w-full"
          >
            {hasScore ? "Update Score" : "Score Application"}
          </Button>
        </div>
      </div>
    </SideModal>
  );
};

export default ScreeningApplicationDetailsModal;

