"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import LineChart from "@/src/components/base/LineChart";
import BarChart from "@/src/components/base/BarChart";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { useAuthStore } from "@/src/store";
import DashboardLoading from "@/src/components/core/DashboardLoading";
import { useToast } from "@/src/hooks/useToast";

import RequestStatsCards from "@/src/components/screen/supervisor/requests/RequestStatsCards";
import PendingRequestCard from "@/src/components/screen/supervisor/requests/PendingRequestCard";
import RequestHistoryList from "@/src/components/screen/supervisor/requests/RequestHistoryList";
import RequestConfirmations from "@/src/components/screen/supervisor/requests/RequestConfirmations";
import { useSupervisorRequestsData } from "@/src/hooks/useSupervisorRequestsData";

/**
 * Supervisor Requests Inbox - view and manage supervisor requests
 */
export default function SupervisorRequests() {
  const { user } = useAuthStore();
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDenyConfirm, setShowDenyConfirm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();
  
  const { requests, projects, students, loading } = useSupervisorRequestsData(user?.id || null);
  const [localRequests, setLocalRequests] = useState(requests);
  
  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  // Chart data - requests over time
  const requestTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthRequests = localRequests.filter((req) => {
        const created = new Date(req.createdAt).getMonth();
        return created <= index;
      });
      return {
        name: month,
        "Total Requests": monthRequests.length,
        "Approved": monthRequests.filter((r) => r.status === "APPROVED").length,
      };
    });
  }, [localRequests]);

  // Chart data - requests by status
  const requestsByStatusData = useMemo(() => {
    const statusMap = localRequests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusMap).map(([name, count]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      "Requests": count,
    }));
  }, [localRequests]);

  const handleApprove = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      // Use supervisorService to approve with capacity validation
      const { supervisorService } = await import("@/src/services/supervisorService");
      await supervisorService.approveRequest(requestId, user.id);
      
      // Update local state
      setLocalRequests(
        localRequests.map((req) =>
          req.id === requestId
            ? { ...req, status: "APPROVED", updatedAt: new Date().toISOString() }
            : req
        )
      );
      
      // Update project supervisor assignment
      const request = localRequests.find((r) => r.id === requestId);
      if (request) {
        const { projectService } = await import("@/src/services/projectService");
        try {
          await projectService.updateProject(request.projectId, {
            supervisorId: user.id,
          });
        } catch (error) {
          console.error("Failed to update project supervisor:", error);
        }
      }
      
      showSuccess("Supervisor request approved successfully!");
      setShowApproveConfirm(false);
      setSelectedRequestId(null);
    } catch (error) {
      console.error("Failed to approve request:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to approve request. Please try again."
      );
    }
  };

  const handleDeny = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      // Use supervisorService to deny request
      const { supervisorService } = await import("@/src/services/supervisorService");
      await supervisorService.denyRequest(requestId, user.id);
      
      // Update local state
      setLocalRequests(
        localRequests.map((req) =>
          req.id === requestId
            ? { ...req, status: "DENIED", updatedAt: new Date().toISOString() }
            : req
        )
      );
      
      showSuccess("Supervisor request denied.");
      setShowDenyConfirm(false);
      setSelectedRequestId(null);
    } catch (error) {
      console.error("Failed to deny request:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to deny request. Please try again."
      );
    }
  };

  if (loading) {
    return <DashboardLoading />;
  }

  const pendingRequests = localRequests.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Supervisor Requests</h1>
        <p className="text-secondary">Review and respond to student supervisor requests</p>
      </div>

      {/* Statistics */}
      <RequestStatsCards requests={localRequests} />

      {/* Capacity Information */}
      {user?.id && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Supervisor Capacity</h3>
              <p className="text-sm text-secondary">
                Track your active project capacity
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {(() => {
                  // Calculate capacity from requests (mock - in production would come from service)
                  const approvedCount = localRequests.filter(
                    (r) => r.status === "APPROVED"
                  ).length;
                  return `${approvedCount} / 10`;
                })()}
              </p>
              <p className="text-xs text-secondary">Active / Max</p>
            </div>
          </div>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Request Trends"
          data={requestTrendData}
          lines={[
            { key: "Total Requests", label: "Total Requests" },
            { key: "Approved", label: "Approved" },
          ]}
        />
        <BarChart
          title="Requests by Status"
          data={requestsByStatusData}
          bars={[
            { key: "Requests", label: "Requests" },
          ]}
        />
      </div>

      {/* Pending Requests */}
      <Card title="Pending Requests">
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <PendingRequestCard
              key={request.id}
              request={request}
              project={projects[request.projectId]}
              student={students[request.studentOrGroupId]}
              onApprove={(requestId) => {
                setSelectedRequestId(requestId);
                setShowApproveConfirm(true);
              }}
              onDeny={(requestId) => {
                setSelectedRequestId(requestId);
                setShowDenyConfirm(true);
              }}
            />
          ))}
          {pendingRequests.length === 0 && (
            <p className="text-center text-muted py-8">No pending requests</p>
          )}
        </div>
      </Card>

      {/* Request History */}
      <RequestHistoryList
        requests={localRequests}
        projects={projects}
        students={students}
      />

      {/* Confirmation Dialogs */}
      <RequestConfirmations
        showApproveConfirm={showApproveConfirm}
        showDenyConfirm={showDenyConfirm}
        onCloseApprove={() => {
          setShowApproveConfirm(false);
          setSelectedRequestId(null);
        }}
        onCloseDeny={() => {
          setShowDenyConfirm(false);
          setSelectedRequestId(null);
        }}
        onConfirmApprove={() => {
          if (selectedRequestId) {
            handleApprove(selectedRequestId);
          }
        }}
        onConfirmDeny={() => {
          if (selectedRequestId) {
            handleDeny(selectedRequestId);
          }
        }}
      />

      
    </div>
  );
}

