"use client";

import React, { useEffect, useState } from "react";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { useAuthStore } from "@/src/store";

import RequestCard from "@/src/components/screen/student/supervisor-request/RequestCard";
import RequestsEmptyState from "@/src/components/screen/student/supervisor-request/RequestsEmptyState";
import { useSupervisorRequestData } from "@/src/hooks/useSupervisorRequestData";

/**
 * Student Supervisor Request - request supervisor for projects
 * Improved layout matching groups page with card-based grid display
 */
export default function SupervisorRequest() {
  const { user } = useAuthStore();

  const { projects, supervisors, requests, loading } = useSupervisorRequestData(user?.id?.toString());
  const [localRequests, setLocalRequests] = useState<SupervisorRequestI[]>([]);

  /**
   * Sync local requests with hook data
   */
  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Supervisor Requests</h1>
          <p className="text-[0.875rem] opacity-60">
            View your supervisor requests
          </p>
        </div>
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
                onCreateRequest={() => {}}
              />
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && localRequests.length === 0 && (
        <RequestsEmptyState />
      )}
    </div>
  );
}

