/**
 * Project Main Content Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { ProjectI } from "@/src/models/project";
import { ApplicationI } from "@/src/models/application";

export interface Props {
  project: ProjectI;
  existingApplication: ApplicationI | null;
}

/**
 * Display main project content (description, skills, application details)
 */
const ProjectMainContent = ({ project, existingApplication }: Props) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <Card title="Project Description">
        <p className="text-secondary whitespace-pre-line">{project.description}</p>
      </Card>

      <Card title="Skills Required">
        <div className="flex flex-wrap gap-2">
          {project.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-pale-primary text-primary rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </Card>

      {existingApplication && (
        <Card title="Your Application">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-secondary mb-1">Application Type</p>
              <p className="font-medium capitalize">
                {existingApplication.applicantType.toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary mb-1">Statement</p>
              <p className="text-secondary">{existingApplication.statement}</p>
            </div>
            <div>
              <p className="text-sm text-secondary mb-1">Status</p>
              <StatusIndicator status={existingApplication.status} />
            </div>
            {existingApplication.score && (
              <div>
                <p className="text-sm text-secondary mb-1">Score</p>
                <p className="font-medium">
                  {existingApplication.score.finalScore} / 100
                </p>
              </div>
            )}
            <div className="text-xs text-muted mt-4">
              Submitted: {new Date(existingApplication.createdAt).toLocaleString()}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectMainContent;








