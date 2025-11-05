/**
 * Request Card Component
 * Enhanced full-width display for supervisor requests with detailed information
 */
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import {
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Calendar,
  Briefcase,
  User,
  DollarSign,
  Target,
  Code,
} from "lucide-react";
import Link from "next/link";
import { formatDateShort } from "@/src/utils/dateFormatters";
import { getInitials, hasAvatar } from "@/src/utils/avatarUtils";

export interface Props {
  request: SupervisorRequestI;
  project: ProjectI | undefined;
  supervisor: UserI | undefined;
  onCreateRequest: () => void;
}

/**
 * Display a single supervisor request card with enhanced UI
 * Full-width card with detailed project information, supervisor details, and status
 */
const RequestCard = ({ request, project, supervisor, onCreateRequest }: Props) => {
  const [avatarError, setAvatarError] = useState(false);

  /**
   * Get status icon and styling based on request status
   * Improved contrast for better readability, no border
   */
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          icon: CheckCircle,
          color: "text-success-dark",
          bg: "bg-muted-green",
        };
      case "DENIED":
        return {
          icon: XCircle,
          color: "text-error-dark",
          bg: "bg-muted-red",
        };
      case "PENDING":
        return {
          icon: Clock,
          color: "text-primary",
          bg: "bg-pale-primary",
        };
      default:
        return {
          icon: Clock,
          color: "text-secondary",
          bg: "bg-pale",
        };
    }
  };

  /**
   * Format currency display
   */
  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Truncate text to specified length
   */
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const statusInfo = getStatusInfo(request.status);
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200 w-full"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Section */}
        <div className="flex-1 space-y-4">
          {/* Header with project title and status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={18} className="opacity-60" />
                <h3 className="text-[1.125rem] font-[600] flex-1">
                  {project?.title || "Project"}
                </h3>
              </div>
              {project && (
                <Link
                  href={`/student/projects/${project.id}`}
                  className="text-[0.75rem] text-primary hover:underline inline-flex items-center gap-1"
                >
                  View Project Details
                </Link>
              )}
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusInfo.bg}`}
            >
              <StatusIcon size={18} className={statusInfo.color} />
              <StatusIndicator status={request.status} />
            </div>
          </div>

          {/* Project Description */}
          {project?.description && (
            <div className="pb-4 border-b border-pale">
              <p className="text-[0.875rem] opacity-70 leading-relaxed">
                {truncateText(project.description, 200)}
              </p>
            </div>
          )}

          {/* Project Details Grid */}
          {project && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-pale">
              {/* Budget */}
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="opacity-60" />
                <div>
                  <p className="text-[0.75rem] opacity-60">Budget</p>
                  <p className="text-[0.875rem] font-medium">
                    {formatCurrency(project.budget, project.currency)}
                  </p>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-center gap-2">
                <Target size={16} className="opacity-60" />
                <div>
                  <p className="text-[0.75rem] opacity-60">Deadline</p>
                  <p className="text-[0.875rem] font-medium">
                    {formatDateShort(project.deadline)}
                  </p>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-center gap-2">
                <User size={16} className="opacity-60" />
                <div>
                  <p className="text-[0.75rem] opacity-60">Capacity</p>
                  <p className="text-[0.875rem] font-medium">
                    {project.capacity} students
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <Code size={16} className="opacity-60" />
                <div>
                  <p className="text-[0.75rem] opacity-60">Status</p>
                  <p className="text-[0.875rem] font-medium capitalize">
                    {project.status.replace("-", " ")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          {project && project.skills && project.skills.length > 0 && (
            <div className="pb-4 border-b border-pale">
              <div className="flex items-center gap-2 mb-2">
                <Code size={14} className="opacity-60" />
                <span className="text-[0.8125rem] opacity-60">Required Skills:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.skills.slice(0, 6).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-pale text-primary rounded-full text-[0.75rem] font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {project.skills.length > 6 && (
                  <span className="px-2 py-1 bg-pale text-primary rounded-full text-[0.75rem] font-medium">
                    +{project.skills.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Supervisor information */}
          <div className="pb-4 border-b border-pale">
            <div className="flex items-center gap-3 mb-2">
              <User size={16} className="opacity-60" />
              <span className="text-[0.8125rem] opacity-60">Supervisor:</span>
              
              {/* Supervisor Avatar */}
              {supervisor && (
                <div className="flex items-center gap-3">
                  {(() => {
                    const avatarUrl = supervisor.profile?.avatar;
                    const hasImage = hasAvatar(avatarUrl) && !avatarError;
                    const initials = getInitials(supervisor.name);

                    return (
                      <div className="flex items-center gap-2">
                        {hasImage ? (
                          <img
                            src={avatarUrl}
                            alt={supervisor.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-pale"
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-pale-primary border-2 border-pale flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {initials}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-[0.875rem] font-medium">
                            {supervisor.name}
                          </span>
                          {supervisor.email && (
                            <p className="text-[0.75rem] opacity-50">
                              {supervisor.email}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              {!supervisor && (
                <span className="text-[0.875rem] font-medium">Unknown</span>
              )}
            </div>
          </div>

          {/* Request message */}
          {request.message && (
            <div className="pb-4 border-b border-pale">
              <p className="text-[0.8125rem] opacity-60 mb-2 font-medium">
                Request Message:
              </p>
              <p className="text-[0.875rem] opacity-70 leading-relaxed bg-pale p-3 rounded-lg">
                {request.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer with dates and actions */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-pale">
        <div className="flex items-center gap-4 text-[0.75rem] opacity-50">
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>Requested {formatDateShort(request.createdAt)}</span>
          </div>
          {request.updatedAt && request.updatedAt !== request.createdAt && (
            <>
              <span>•</span>
              <span>Updated {formatDateShort(request.updatedAt)}</span>
            </>
          )}
        </div>

        {/* Action button for denied requests */}
        {request.status === "DENIED" && (
          <Button
            onClick={onCreateRequest}
            className="bg-primary text-[0.875rem] px-4 py-2"
          >
            <UserPlus size={14} className="mr-1" />
            Request Another
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default RequestCard;

