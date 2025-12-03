/**
 * Request Supervisor Modal Component
 */
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import Select from "@/src/components/core/Select";
import TextArea from "@/src/components/core/TextArea";
import { ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import { ValidationErrors } from "@/src/utils/supervisorRequestValidation";
import { supervisorService } from "@/src/services/supervisorService";
import { Users, AlertCircle } from "lucide-react";

export interface Props {
  open: boolean;
  projects: ProjectI[];
  supervisors: UserI[];
  selectedProject: string;
  selectedSupervisor: string;
  requestMessage: string;
  errors: ValidationErrors;
  submitting?: boolean;
  onClose: () => void;
  onProjectChange: (projectId: string) => void;
  onSupervisorChange: (supervisorId: string) => void;
  onMessageChange: (message: string) => void;
  onClearError: (field: string) => void;
  onSubmit: () => void;
}

/**
 * Modal for requesting a supervisor
 */
const RequestSupervisorModal = ({
  open,
  projects,
  supervisors,
  selectedProject,
  selectedSupervisor,
  requestMessage,
  errors,
  submitting = false,
  onClose,
  onProjectChange,
  onSupervisorChange,
  onMessageChange,
  onClearError,
  onSubmit,
}: Props) => {
  const [supervisorCapacities, setSupervisorCapacities] = useState<Record<string, { current: number; max: number }>>({});
  const [/* loadingCapacities */, setLoadingCapacities] = useState(false);

  /**
   * Load supervisor capacities when supervisor list changes
   */
  useEffect(() => {
    const loadCapacities = async () => {
      if (supervisors.length === 0) return;

      setLoadingCapacities(true);
      try {
        const capacityPromises = supervisors.map(async (supervisor) => {
          const capacity = await supervisorService.getCapacity(supervisor.id);
          return {
            supervisorId: supervisor.id,
            capacity: {
              current: capacity.currentActive,
              max: capacity.maxActive,
            },
          };
        });

        const results = await Promise.all(capacityPromises);
        const capacityMap: Record<string, { current: number; max: number }> = {};
        results.forEach(({ supervisorId, capacity }) => {
          capacityMap[supervisorId] = capacity;
        });
        setSupervisorCapacities(capacityMap);
      } catch (error) {
        console.error("Failed to load supervisor capacities:", error);
      } finally {
        setLoadingCapacities(false);
      }
    };

    loadCapacities();
  }, [supervisors]);

  /**
   * Get supervisor capacity info for display
   */
  const getSupervisorCapacityInfo = (supervisorId: string) => {
    const capacity = supervisorCapacities[supervisorId];
    if (!capacity) return null;
    return capacity;
  };

  return (
    <Modal
      title="Request Supervisor"
      open={open}
      handleClose={onClose}
      actions={[
        <Button key="cancel" onClick={onClose} className="bg-pale text-primary" disabled={submitting}>
          Cancel
        </Button>,
        <Button key="submit" onClick={onSubmit} className="bg-primary" disabled={submitting}>
          {submitting ? "Sending..." : "Send Request"}
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {/* Project selection - hidden if project is pre-selected from path */}
        {projects.length > 0 && (
          <>
            <Select
              title="Select Project *"
              options={projects.map((p) => ({
                value: String(p.id),
                label: p.title,
              }))}
              value={selectedProject || null}
              onChange={(option) => {
                const projectId =
                  typeof option === "string" ? option : String(option.value);
                onProjectChange(projectId);
                onClearError("project");
              }}
              placeHolder={projects.length === 0 ? "No assigned projects available" : "Choose a project"}
              error={errors.project}
              disabled={submitting || projects.length === 0 || (projects.length === 1 && selectedProject)}
            />
            {projects.length === 0 && (
              <p className="text-xs text-secondary mt-1">
                You must be assigned to a project before requesting a supervisor
              </p>
            )}
          </>
        )}
        {projects.length === 0 && selectedProject && (
          <div className="p-3 bg-pale rounded-lg">
            <p className="text-sm font-semibold mb-1">Project</p>
            <p className="text-sm text-secondary">Project ID: {selectedProject}</p>
          </div>
        )}
        <Select
          title="Select Supervisor *"
          options={supervisors.map((s) => {
            const capacity = getSupervisorCapacityInfo(s.id);
            const isAtCapacity = capacity && capacity.current >= capacity.max;
            return {
              value: s.id,
              label: `${s.name}${capacity ? ` (${capacity.current}/${capacity.max})` : ""}${isAtCapacity ? " - Full" : ""}`,
            };
          })}
          value={selectedSupervisor}
          onChange={(option) => {
            const supervisorId =
              typeof option === "string" ? option : (option.value as string);
            onSupervisorChange(supervisorId);
            onClearError("supervisor");
          }}
          placeHolder="Choose a supervisor"
          error={errors.supervisor}
          disabled={submitting}
        />
        {selectedSupervisor && (() => {
          const capacity = getSupervisorCapacityInfo(selectedSupervisor);
          if (!capacity) return null;
          const isAtCapacity = capacity.current >= capacity.max;
          return (
            <div className={`p-3 rounded-lg border ${isAtCapacity ? "bg-pale-primary border-primary" : "bg-pale border-custom"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-primary" />
                <span className="text-sm font-semibold">Supervisor Capacity</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary">
                  Active Projects: {capacity.current} / {capacity.max}
                </span>
                {isAtCapacity && (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <AlertCircle size={12} />
                    At Capacity
                  </span>
                )}
              </div>
              {!isAtCapacity && (
                <div className="w-full bg-very-pale rounded-full h-1.5 mt-2">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(capacity.current / capacity.max) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })()}
        <TextArea
          title="Message (Optional)"
          value={requestMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Add a message to your supervisor request..."
          rows={4}
        />
      </div>
    </Modal>
  );
};

export default RequestSupervisorModal;




