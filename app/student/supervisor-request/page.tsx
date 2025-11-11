"use client";

import React, { useEffect, useState } from "react";
import Button from "@/src/components/core/Button";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { useAuthStore } from "@/src/store";
import { UserPlus } from "lucide-react";
import { useToast } from "@/src/hooks/useToast";

import RequestCard from "@/src/components/screen/student/supervisor-request/RequestCard";
import RequestsEmptyState from "@/src/components/screen/student/supervisor-request/RequestsEmptyState";
import RequestSupervisorModal from "@/src/components/screen/student/supervisor-request/RequestSupervisorModal";
import { useSupervisorRequestData } from "@/src/hooks/useSupervisorRequestData";
import { useSupervisorRequestForm } from "@/src/hooks/useSupervisorRequestForm";

/**
 * Student Supervisor Request - request supervisor for projects
 * Improved layout matching groups page with card-based grid display
 */
export default function SupervisorRequest() {
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const { projects, supervisors, requests, loading } = useSupervisorRequestData(user?.id?.toString());
  const [localRequests, setLocalRequests] = useState<SupervisorRequestI[]>([]);

  const {
    formData,
    requestMessage,
    errors,
    submitting,
    setFormData,
    setRequestMessage,
    clearError,
    handleSubmitRequest,
    reset,
  } = useSupervisorRequestForm(isRequestModalOpen);

  /**
   * Sync local requests with hook data
   */
  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  /**
   * Handle submit request
   * Refetches requests after successful submission to sync UI
   */
  const handleSubmit = async () => {
    if (!user) return;
    try {
      await handleSubmitRequest(user.id.toString(), async (newRequest) => {
        // Refetch requests to get updated data from backend
        const { supervisorRepository } = await import("@/src/repositories/supervisorRepository");
        const updatedRequests = await supervisorRepository.getRequests(undefined, undefined, user.id.toString());
        setLocalRequests(updatedRequests);
        setIsRequestModalOpen(false);
        showSuccess("Supervisor request submitted successfully");
      });
    } catch (error) {
      console.error("Failed to submit request:", error);
      // Error already shown in hook
    }
  };

  /**
   * Handle create request button click
   */
  const handleCreateRequest = () => {
    setIsRequestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Supervisor Requests</h1>
          <p className="text-[0.875rem] opacity-60">
            Request supervisors for your projects
          </p>
        </div>
        <Button
          onClick={handleCreateRequest}
          className="bg-primary"
        >
          <UserPlus size={16} className="mr-2" />
          New Request
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-[0.875rem] opacity-60">Loading requests...</p>
          </div>
        </div>
      )}

      {/* Requests List - Full Width Cards */}
      {!loading && localRequests.length > 0 && (
        <div className="space-y-6">
          {localRequests.map((request) => {
            const project = projects.find((p) => p.id === request.projectId);
            const supervisor = supervisors.find((s) => s.id === request.supervisorId);

            return (
              <RequestCard
                key={request.id}
                request={request}
                project={project}
                supervisor={supervisor}
                onCreateRequest={handleCreateRequest}
              />
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && localRequests.length === 0 && (
        <RequestsEmptyState onCreateRequest={handleCreateRequest} />
      )}

      {/* Request Modal */}
      <RequestSupervisorModal
        open={isRequestModalOpen}
        projects={projects}
        supervisors={supervisors}
        selectedProject={formData.projectId}
        selectedSupervisor={formData.supervisorId}
        requestMessage={requestMessage}
        errors={errors}
        submitting={submitting}
        onClose={() => {
          setIsRequestModalOpen(false);
          reset();
        }}
        onProjectChange={(projectId) => {
          setFormData({ ...formData, projectId });
          clearError("project");
        }}
        onSupervisorChange={(supervisorId) => {
          setFormData({ ...formData, supervisorId });
          clearError("supervisor");
        }}
        onMessageChange={setRequestMessage}
        onClearError={clearError}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

