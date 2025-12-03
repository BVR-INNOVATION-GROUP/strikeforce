"use client";

import React, { useEffect, useState, useMemo } from "react";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { useAuthStore } from "@/src/store";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { useToast } from "@/src/hooks/useToast";

import LineChart from "@/src/components/base/LineChart";
import BarChart from "@/src/components/base/BarChart";
import SupervisorStatsCards from "@/src/components/screen/supervisor/SupervisorStatsCards";
import PendingRequestsList from "@/src/components/screen/supervisor/PendingRequestsList";
import Card from "@/src/components/core/Card";
import { Users } from "lucide-react";
import Link from "next/link";

/**
 * Supervisor Dashboard - overview of requests and projects
 */
export default function SupervisorDashboard() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<SupervisorRequestI[]>([]);
  const [capacity, setCapacity] = useState<{ current: number; max: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDenyConfirm, setShowDenyConfirm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const requestsData = await import("@/src/data/mockSupervisorRequests.json");
        const supervisorRequests = (requestsData.default as SupervisorRequestI[]).filter(
          (req) => req.supervisorId === user?.id
        );
        setRequests(supervisorRequests);
        
        // Load capacity information
        if (user?.id) {
          const { supervisorService } = await import("@/src/services/supervisorService");
          const capacityData = await supervisorService.getCapacity(user.id);
          setCapacity({
            current: capacityData.currentActive,
            max: capacityData.maxActive,
          });
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  // Chart data - requests over time
  const requestTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const monthRequests = requests.filter((req) => {
        const created = new Date(req.createdAt).getMonth();
        return created <= index;
      });
      return {
        name: month,
        "Total Requests": monthRequests.length,
        "Approved": monthRequests.filter((r) => r.status === "APPROVED").length,
      };
    });
  }, [requests]);

  // Chart data - requests by status
  const requestsByStatusData = useMemo(() => {
    const statusMap = requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusMap).map(([name, count]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      "Requests": count,
    }));
  }, [requests]);

  const handleApprove = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      const { supervisorService } = await import("@/src/services/supervisorService");
      await supervisorService.approveRequest(requestId, user.id);
      
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, status: "APPROVED" } : req
        )
      );
      showSuccess('Supervisor request approved successfully!');
      setShowApproveConfirm(false);
      setSelectedRequestId(null);
    } catch (error) {
      console.error("Failed to approve request:", error);
      showError(
        error instanceof Error
          ? error.message
          : 'Failed to approve request. Please try again.'
      );
    }
  };

  const handleDeny = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      const { supervisorService } = await import("@/src/services/supervisorService");
      await supervisorService.denyRequest(requestId, user.id);
      
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, status: "DENIED" } : req
        )
      );
      showSuccess('Supervisor request denied.');
      setShowDenyConfirm(false);
      setSelectedRequestId(null);
    } catch (error) {
      console.error("Failed to deny request:", error);
      showError(
        error instanceof Error
          ? error.message
          : 'Failed to deny request. Please try again.'
      );
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-secondary">Welcome, {user?.name}</p>
      </div>

      {/* Stats */}
      <SupervisorStatsCards requests={requests} />

      {/* Capacity and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {capacity && (
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <Users size={24} className="text-primary" />
              <h3 className="font-semibold">Supervisor Capacity</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Active Projects</span>
                <span className="font-semibold">
                  {capacity.current} / {capacity.max}
                </span>
              </div>
              <div className="w-full bg-pale rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(capacity.current / capacity.max) * 100}%`,
                  }}
                />
              </div>
              {capacity.current >= capacity.max && (
                <p className="text-xs text-orange-600">
                  Capacity reached. Cannot approve more requests.
                </p>
              )}
            </div>
          </Card>
        )}
        
        <Card>
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/supervisor/requests">
              <button className="w-full text-left p-3 bg-pale hover:bg-very-pale rounded-lg transition-colors">
                <span className="font-medium">Review Requests</span>
                <p className="text-xs text-secondary mt-1">
                  {requests.filter((r) => r.status === "PENDING").length} pending
                </p>
              </button>
            </Link>
            <Link href="/supervisor/reviews">
              <button className="w-full text-left p-3 bg-pale hover:bg-very-pale rounded-lg transition-colors">
                <span className="font-medium">Review Milestones</span>
              </button>
            </Link>
            <Link href="/supervisor/projects">
              <button className="w-full text-left p-3 bg-pale hover:bg-very-pale rounded-lg transition-colors">
                <span className="font-medium">View Projects</span>
              </button>
            </Link>
          </div>
        </Card>
      </div>

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
      <PendingRequestsList
        requests={requests}
        onApprove={(requestId) => {
          setSelectedRequestId(requestId);
          setShowApproveConfirm(true);
        }}
        onDeny={(requestId) => {
          setSelectedRequestId(requestId);
          setShowDenyConfirm(true);
        }}
      />

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showApproveConfirm}
        onClose={() => {
          setShowApproveConfirm(false);
          setSelectedRequestId(null);
        }}
        onConfirm={() => {
          if (selectedRequestId) {
            handleApprove(selectedRequestId);
          }
        }}
        title="Approve Supervisor Request"
        message="Are you sure you want to approve this supervisor request? You will be assigned to this project."
        type="info"
        confirmText="Approve"
      />

      <ConfirmationDialog
        open={showDenyConfirm}
        onClose={() => {
          setShowDenyConfirm(false);
          setSelectedRequestId(null);
        }}
        onConfirm={() => {
          if (selectedRequestId) {
            handleDeny(selectedRequestId);
          }
        }}
        title="Deny Supervisor Request"
        message="Are you sure you want to deny this supervisor request? The student will be notified and can request another supervisor."
        type="warning"
        confirmText="Deny"
      />

      
    </div>
  );
}

