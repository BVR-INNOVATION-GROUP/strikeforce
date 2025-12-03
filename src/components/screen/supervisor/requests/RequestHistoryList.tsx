/**
 * Request History List Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import Avatar from "@/src/components/core/Avatar";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";

export interface Props {
  requests: SupervisorRequestI[];
  projects: Record<string, ProjectI>;
  students: Record<string, UserI>;
}

/**
 * Display request history
 */
const RequestHistoryList = ({ requests, projects, students }: Props) => {
  const historyRequests = requests.filter(
    (r) => r.status === "APPROVED" || r.status === "DENIED"
  );

  if (historyRequests.length === 0) {
    return null;
  }

  return (
    <Card title="Request History">
      <div className="space-y-3">
        {historyRequests.map((request) => {
          const project = projects[request.projectId];
          const student = students[request.studentOrGroupId];

          return (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 bg-pale rounded-lg"
            >
              <div className="flex items-center gap-3">
                {student && (
                  <Avatar
                    src={student.profile.avatar}
                    name={student.name}
                    size="sm"
                  />
                )}
                <div>
                  <p className="font-semibold">{student?.name || "Student"}</p>
                  <p className="text-sm text-secondary">
                    {project?.title || request.projectId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusIndicator status={request.status} />
                <span className="text-sm text-muted">
                  {new Date(request.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RequestHistoryList;









