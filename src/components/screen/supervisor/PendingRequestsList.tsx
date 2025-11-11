/**
 * Pending Requests List Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import { SupervisorRequestI } from "@/src/models/supervisor";

export interface Props {
  requests: SupervisorRequestI[];
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
}

/**
 * Display pending supervisor requests
 */
const PendingRequestsList = ({ requests, onApprove, onDeny }: Props) => {
  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <Card title="Pending Supervisor Requests">
      <div className="space-y-3">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 bg-pale rounded-lg"
          >
            <div className="flex-1">
              <p className="font-semibold">Supervisor Request</p>
              <p className="text-sm text-secondary">
                Project ID: {request.projectId}
              </p>
              {request.message && (
                <p className="text-sm text-secondary mt-2">{request.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onApprove(request.id)}
                className="bg-green-500 text-white"
              >
                Approve
              </Button>
              <Button
                onClick={() => onDeny(request.id)}
                className="bg-red-500 text-white"
              >
                Deny
              </Button>
            </div>
          </div>
        ))}
        {pendingRequests.length === 0 && (
          <p className="text-center text-muted py-8">No pending requests</p>
        )}
      </div>
    </Card>
  );
};

export default PendingRequestsList;








