/**
 * Request List Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import Button from "@/src/components/core/Button";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import { UserPlus, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export interface Props {
  requests: SupervisorRequestI[];
  projects: ProjectI[];
  supervisors: UserI[];
  onCreateRequest: () => void;
}

/**
 * Display list of supervisor requests
 */
const RequestList = ({
  requests,
  projects,
  supervisors,
  onCreateRequest,
}: Props) => {
  return (
    <Card title="My Requests">
      <div className="space-y-4">
        {requests.map((request) => {
          const project = projects.find((p) => p.id === request.projectId);
          const supervisor = supervisors.find((s) => s.id === request.supervisorId);

          // Get status icon and color using theme colors
          const getStatusInfo = (status: string) => {
            switch (status) {
              case "APPROVED":
                return { icon: CheckCircle, color: "text-primary", bg: "bg-pale-primary" };
              case "DENIED":
                return { icon: XCircle, color: "text-primary", bg: "bg-pale-primary" };
              case "PENDING":
                return { icon: Clock, color: "text-primary", bg: "bg-pale-primary" };
              default:
                return { icon: Clock, color: "text-secondary", bg: "bg-pale" };
            }
          };

          const statusInfo = getStatusInfo(request.status);
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={request.id}
              className="p-4 bg-pale rounded-lg border border-custom hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {project?.title || "Project"}
                    </h3>
                    {project && (
                      <Link
                        href={`/student/projects/${project.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View Project
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-secondary">Supervisor:</span>
                    <span className="text-sm font-medium">
                      {supervisor?.name || "Unknown"}
                    </span>
                  </div>
                  {request.message && (
                    <div className="p-2 bg-very-pale rounded mt-2 mb-2">
                      <p className="text-sm text-secondary">{request.message}</p>
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${statusInfo.bg}`}>
                  <StatusIcon size={16} className={statusInfo.color} />
                  <StatusIndicator status={request.status} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-custom">
                <div className="flex items-center gap-3 text-xs text-secondary">
                  <span>
                    Requested: {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                  {request.updatedAt &&
                    request.updatedAt !== request.createdAt && (
                      <span>
                        • Updated:{" "}
                        {new Date(request.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                </div>
                {request.status === "DENIED" && (
                  <Button
                    onClick={onCreateRequest}
                    className="bg-primary text-xs px-3 py-1"
                  >
                    Request Another
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {requests.length === 0 && (
          <div className="text-center py-12">
            <UserPlus size={48} className="mx-auto mb-4 text-muted-light" />
            <p className="text-muted mb-2">No supervisor requests yet</p>
            <p className="text-sm text-muted-light mb-4">
              Request a supervisor to get started on a project
            </p>
            <Button onClick={onCreateRequest} className="bg-primary">
              Create Request
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RequestList;




