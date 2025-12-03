/**
 * University Admin Project Actions Card
 * Allows university admins to approve/disapprove and suspend projects
 */
"use client";

import React, { useState } from "react";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import { CheckCircle, XCircle, Pause, AlertCircle } from "lucide-react";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";

export interface Props {
  projectStatus: string;
  onApprove: () => Promise<void>;
  onDisapprove: () => Promise<void>;
  onSuspend: () => Promise<void>;
  isProcessing?: boolean;
}

const UniversityAdminProjectActions: React.FC<Props> = ({
  projectStatus,
  onApprove,
  onDisapprove,
  onSuspend,
  isProcessing = false,
}) => {
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [disapproveConfirmOpen, setDisapproveConfirmOpen] = useState(false);
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false);

  // Normalize status to lowercase for comparison
  const normalizedStatus = (projectStatus || "").toLowerCase();
  const isPublished = normalizedStatus === "published";
  const isSuspended = normalizedStatus === "on-hold" || normalizedStatus === "suspended";
  const isDraft = normalizedStatus === "draft" || normalizedStatus === "pending";

  return (
    <>
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-[1rem] font-[600] mb-1">Project Management</h3>
            <p className="text-[0.875rem] opacity-60">
              Approve, disapprove, or suspend this project
            </p>
          </div>

          <div className="space-y-3">
            {/* Approve Button - show if not published */}
            {!isPublished && (
              <Button
                onClick={() => setApproveConfirmOpen(true)}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Approve Project
              </Button>
            )}

            {/* Disapprove Button - show if published */}
            {isPublished && (
              <Button
                onClick={() => setDisapproveConfirmOpen(true)}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                Disapprove Project
              </Button>
            )}

            {/* Suspend Button - show if not suspended */}
            {!isSuspended && (
              <Button
                onClick={() => setSuspendConfirmOpen(true)}
                disabled={isProcessing}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2"
              >
                <Pause size={18} />
                Suspend Project
              </Button>
            )}

            {/* Unsuspend Button (if suspended) */}
            {isSuspended && (
              <Button
                onClick={async () => {
                  // Unsuspend by approving again
                  await onApprove();
                }}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Unsuspend Project
              </Button>
            )}

            {/* Status Indicator */}
            <div className="pt-3 border-t border-custom">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="text-secondary" />
                <span className="text-secondary">
                  Current Status: <span className="font-semibold capitalize">{projectStatus}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Approve Confirmation */}
      <ConfirmationDialog
        open={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        onConfirm={async () => {
          await onApprove();
          setApproveConfirmOpen(false);
        }}
        title="Approve Project"
        message="Are you sure you want to approve this project? It will be published and visible to students."
        confirmText="Approve"
        cancelText="Cancel"
        confirmClassName="bg-green-600 hover:bg-green-700"
      />

      {/* Disapprove Confirmation */}
      <ConfirmationDialog
        open={disapproveConfirmOpen}
        onClose={() => setDisapproveConfirmOpen(false)}
        onConfirm={async () => {
          await onDisapprove();
          setDisapproveConfirmOpen(false);
        }}
        title="Disapprove Project"
        message="Are you sure you want to disapprove this project? It will be moved back to draft status and hidden from students."
        confirmText="Disapprove"
        cancelText="Cancel"
        confirmClassName="bg-red-600 hover:bg-red-700"
      />

      {/* Suspend Confirmation */}
      <ConfirmationDialog
        open={suspendConfirmOpen}
        onClose={() => setSuspendConfirmOpen(false)}
        onConfirm={async () => {
          await onSuspend();
          setSuspendConfirmOpen(false);
        }}
        title="Suspend Project"
        message="Are you sure you want to suspend this project? It will be put on hold and students will not be able to apply."
        confirmText="Suspend"
        cancelText="Cancel"
        confirmClassName="bg-amber-600 hover:bg-amber-700"
      />
    </>
  );
};

export default UniversityAdminProjectActions;

