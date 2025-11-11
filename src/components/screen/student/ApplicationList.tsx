/**
 * Student Application List Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import Button from "@/src/components/core/Button";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import Link from "next/link";

export interface Props {
  applications: ApplicationI[];
  projects: ProjectI[];
}

/**
 * Display list of student applications
 */
const ApplicationList = ({ applications, projects }: Props) => {
  return (
    <Card title="My Applications">
      <div className="space-y-3">
        {applications.map((app) => {
          const project = projects.find((p) => p.id === app.projectId);
          return (
            <div
              key={app.id}
              className="flex items-center justify-between p-3 bg-pale rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{project?.title || "Project"}</h3>
                <p className="text-sm text-secondary">
                  Applied as {app.applicantType === "GROUP" ? "Group" : "Individual"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusIndicator status={app.status} />
                {app.score && (
                  <span className="text-sm font-medium">
                    Score: {app.score.finalScore}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {applications.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted mb-4">No active applications</p>
            <Link href="/student/projects">
              <Button className="bg-primary">Find Projects</Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ApplicationList;








