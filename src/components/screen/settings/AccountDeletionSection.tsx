/**
 * Account Deletion Section - handles account deletion
 */
"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/src/store";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/hooks/useToast";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import { Trash2, AlertTriangle } from "lucide-react";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";

export interface Props {
  userId: string;
}

/**
 * Account deletion section component
 */
const AccountDeletionSection = ({ userId }: Props) => {
  const { logout } = useAuthStore();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // TODO: Implement account deletion API call
      // await userService.deleteAccount(userId);
      logout();
      // Force full page reload to ensure middleware sees cleared cookies
      // Wait longer to ensure all cleanup completes
      // The logout flag will be cleared by onRehydrateStorage after preventing rehydration
      setTimeout(() => {
        window.location.href = "/";
      }, 200);
      showSuccess("Account deleted successfully");
    } catch (error) {
      console.error("Failed to delete account:", error);
      showError("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Card title="Danger Zone">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={20} className="text-primary" />
            <p className="text-sm opacity-60">
              Permanently delete your account and all associated data
            </p>
          </div>

          <div className="p-4 bg-pale-primary rounded-lg border border-primary/20">
            <div className="mb-3">
              <p className="font-medium mb-1">Delete Account</p>
              <p className="text-sm opacity-60">
                Once you delete your account, there is no going back. All your
                data, projects, and information will be permanently removed.
              </p>
            </div>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-primary  rounded-full"
              disabled={deleting}
            >
              <Trash2 size={16} className="mr-2" />
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message={`Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.`}
        confirmText="Delete Account"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />
    </>
  );
};

export default AccountDeletionSection;

