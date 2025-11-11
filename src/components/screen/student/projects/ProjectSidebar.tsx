/**
 * Project Sidebar Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import { ProjectI } from "@/src/models/project";
import { DollarSign, Calendar, Users } from "lucide-react";

export interface Props {
  project: ProjectI;
}

/**
 * Display project sidebar with details and eligibility
 */
const ProjectSidebar = ({ project }: Props) => {
  return (
    <div className="space-y-6">
      <Card title="Project Details">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <DollarSign size={20} className="text-muted" />
            <div>
              <p className="text-sm text-secondary">Budget</p>
              <p className="font-semibold">
                ${project.budget.toLocaleString()} {project.currency}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-muted" />
            <div>
              <p className="text-sm text-secondary">Deadline</p>
              <p className="font-semibold">
                {new Date(project.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users size={20} className="text-muted" />
            <div>
              <p className="text-sm text-secondary">Capacity</p>
              <p className="font-semibold">
                {project.capacity || "Not specified"} students/group
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Eligibility">
        <div className="space-y-2 text-sm">
          <p className="text-secondary">
            <strong>Course:</strong> Must match project requirements
          </p>
          <p className="text-secondary">
            <strong>Skills:</strong> {project.skills.slice(0, 3).join(", ")}
            {project.skills.length > 3 &&
              ` +${project.skills.length - 3} more`}
          </p>
          <p className="text-secondary">
            <strong>Deadline:</strong> Applications close before project
            deadline
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProjectSidebar;








