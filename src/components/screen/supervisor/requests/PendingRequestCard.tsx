/**
 * Pending Request Card Component
 */
"use client";

import React from "react";
import Button from "@/src/components/core/Button";
import Avatar from "@/src/components/core/Avatar";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import { CheckCircle, XCircle } from "lucide-react";

export interface Props {
  request: SupervisorRequestI;
  project: ProjectI | undefined;
  student: UserI | undefined;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
}

/**
 * Display a pending supervisor request
 */
const PendingRequestCard = ({
  request,
  project,
  student,
  onApprove,
  onDeny,
}: Props) => {
  return (
    <div className="p-4 bg-pale rounded-lg border border-custom">
      <div className="flex items-start gap-4 mb-4">
        {student && (
          <Avatar src={student.profile.avatar} name={student.name} size="md" />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{student?.name || "Student"}</h3>
          <p className="text-sm text-secondary">
            Project: {project?.title || request.projectId}
          </p>
          {request.message && (
            <p className="text-sm text-secondary mt-2 p-2 bg-white rounded">
              {request.message}
            </p>
          )}
          <p className="text-xs text-muted mt-2">
            Requested: {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onApprove(request.id)}
            className="bg-green-500 text-white"
          >
            <CheckCircle size={16} className="mr-1" />
            Approve
          </Button>
          <Button
            onClick={() => onDeny(request.id)}
            className="bg-red-500 text-white"
          >
            <XCircle size={16} className="mr-1" />
            Deny
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PendingRequestCard;





