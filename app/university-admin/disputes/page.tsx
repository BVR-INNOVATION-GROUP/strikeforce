"use client";

import React, { useEffect, useState } from "react";
import StatCard from "@/src/components/core/StatCard";
import { DisputeI } from "@/src/models/dispute";
import { UserI } from "@/src/models/user";
import { AlertCircle, Scale } from "lucide-react";
import DisputeCard from "@/src/components/screen/university-admin/disputes/DisputeCard";
import DisputeDetailsModal from "@/src/components/screen/university-admin/disputes/DisputeDetailsModal";

/**
 * University Admin Dispute Center - review and resolve disputes
 */
export default function UniversityAdminDisputes() {
  const [disputes, setDisputes] = useState<DisputeI[]>([]);
  const [users, setUsers] = useState<Record<string, UserI>>({});
  const [loading, setLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<DisputeI | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load users data for avatars
        const usersData = await import("@/src/data/mockUsers.json");
        const usersList = usersData.default as UserI[];
        const usersMap: Record<string, UserI> = {};
        usersList.forEach((user) => {
          usersMap[user.id] = user;
        });
        setUsers(usersMap);

        // Mock disputes data
        const sampleDisputes: DisputeI[] = [
          {
            id: "dispute-1",
            subjectType: "MILESTONE",
            subjectId: "milestone-1",
            reason: "Quality concerns",
            description: "Partner disputes the quality of submitted work",
            evidence: ["/evidence/doc1.pdf"],
            status: "IN_REVIEW",
            level: "UNIVERSITY_ADMIN",
            raisedBy: "user-partner-1",
            assignedTo: "user-admin-1",
            createdAt: "2024-02-15T10:00:00Z",
            updatedAt: "2024-02-16T10:00:00Z",
          },
        ];
        setDisputes(sampleDisputes);
      } catch (error) {
        console.error("Failed to load disputes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /**
   * Handle dispute review
   */
  const handleReview = (dispute: DisputeI) => {
    // In production, open dispute review modal/page
    console.log("Review dispute:", dispute);
  };

  /**
   * Open details modal
   */
  const handleViewDetails = (dispute: DisputeI) => {
    setSelectedDispute(dispute);
    setIsDetailsModalOpen(true);
  };

  const openDisputes = disputes.filter((d) => d.status === "OPEN" || d.status === "IN_REVIEW");
  const resolvedDisputes = disputes.filter((d) => d.status === "RESOLVED");

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Dispute Center</h1>
        <p className="text-[0.875rem] opacity-60">Review and resolve disputes</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          icon={<AlertCircle size={20} />}
          title="Open Disputes"
          value={openDisputes.length}
        />
        <StatCard
          icon={<Scale size={20} />}
          title="Resolved"
          value={resolvedDisputes.length}
        />
      </div>

      {/* Disputes Grid */}
      {disputes.length === 0 ? (
        <div className="text-center py-12 bg-paper rounded-lg">
          <p className="text-[0.875rem] opacity-60">No disputes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              onReview={handleReview}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <DisputeDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDispute(null);
        }}
        dispute={selectedDispute}
        raisedByUser={selectedDispute ? users[selectedDispute.raisedBy] : undefined}
        assignedToUser={selectedDispute?.assignedTo ? users[selectedDispute.assignedTo] : undefined}
        onReview={handleReview}
      />
    </div>
  );
}

