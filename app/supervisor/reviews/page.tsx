"use client";

import React, { Suspense } from "react";
import { useAuthStore } from "@/src/store";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/src/hooks/useToast";

import MilestoneReviewList from "@/src/components/screen/supervisor/reviews/MilestoneReviewList";
import MilestoneReviewDetail from "@/src/components/screen/supervisor/reviews/MilestoneReviewDetail";
import ReviewConfirmations from "@/src/components/screen/supervisor/reviews/ReviewConfirmations";
import { useSupervisorReviews } from "@/src/hooks/useSupervisorReviews";

/**
 * Supervisor Milestone Review - review and approve milestones for partner review
 */
function SupervisorReviewsContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const {
    projects,
    milestones,
    selectedMilestone,
    reviewNotes,
    risks,
    progressAdjustment,
    loading,
    showApproveConfirm,
    showRequestChangesConfirm,
    setSelectedMilestone,
    setReviewNotes,
    setRisks,
    setProgressAdjustment,
    setShowApproveConfirm,
    setShowRequestChangesConfirm,
    handleApproveForPartner,
    handleRequestChanges,
  } = useSupervisorReviews(user?.id, projectId);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Milestone Reviews</h1>
        <p className="text-gray-600">Review submitted milestones and approve for partner review</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones List */}
        <MilestoneReviewList
          milestones={milestones}
          selectedMilestone={selectedMilestone}
          project={selectedProject}
          onSelect={(milestone) => {
            setSelectedMilestone(milestone);
            setReviewNotes("");
            setRisks("");
            setProgressAdjustment(100);
          }}
        />

        {/* Review Panel */}
        <MilestoneReviewDetail
          milestone={selectedMilestone}
          reviewNotes={reviewNotes}
          risks={risks}
          progressAdjustment={progressAdjustment}
          onNotesChange={setReviewNotes}
          onRisksChange={setRisks}
          onProgressChange={setProgressAdjustment}
          onApprove={handleApproveForPartner}
          onRequestChanges={handleRequestChanges}
          showApproveConfirm={showApproveConfirm}
          showRequestChangesConfirm={showRequestChangesConfirm}
          onShowApproveConfirm={() => setShowApproveConfirm(true)}
          onShowRequestChangesConfirm={() => setShowRequestChangesConfirm(true)}
        />
      </div>

      {/* Confirmation Dialogs */}
      <ReviewConfirmations
        showApproveConfirm={showApproveConfirm}
        showRequestChangesConfirm={showRequestChangesConfirm}
        onCloseApprove={() => setShowApproveConfirm(false)}
        onCloseRequestChanges={() => setShowRequestChangesConfirm(false)}
        onConfirmApprove={handleApproveForPartner}
        onConfirmRequestChanges={handleRequestChanges}
      />

      
    </div>
  );
}

export default function SupervisorReviews() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <SupervisorReviewsContent />
    </Suspense>
  );
}

