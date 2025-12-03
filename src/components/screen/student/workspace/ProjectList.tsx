/**
 * Project List Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { ProjectI } from "@/src/models/project";

export interface Props {
  projects: ProjectI[];
  selectedProject: ProjectI | null;
  onSelect: (project: ProjectI) => void;
}

/**
 * Display list of assigned projects
 */
const ProjectList = ({ projects, selectedProject, onSelect }: Props) => {
  return (
    <Card title="My Projects" className="lg:col-span-1">
      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelect(project)}
            className={`p-3 rounded-lg cursor-pointer hover-bg-pale ${
              selectedProject?.id === project.id ? "bg-pale-primary" : ""
            }`}
          >
            <p className="font-semibold">{project.title}</p>
            <p className="text-sm text-secondary">
              {project.description.substring(0, 50)}...
            </p>
            <StatusIndicator status={project.status} className="mt-2" />
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-center text-muted py-8">No assigned projects</p>
        )}
      </div>
    </Card>
  );
};

export default ProjectList;









