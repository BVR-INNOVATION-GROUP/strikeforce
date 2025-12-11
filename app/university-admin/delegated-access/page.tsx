"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { Plus, UserX, UserCheck } from "lucide-react";
import Modal from "@/src/components/base/Modal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import {
  DelegatedAccessI,
  CreateDelegatedAccessRequest,
} from "@/src/models/delegatedAccess";
import { delegatedAccessRepository } from "@/src/repositories/delegatedAccessRepository";
import { getInitials } from "@/src/utils/avatarUtils";
import Skeleton from "@/src/components/core/Skeleton";
import { useAuthStore } from "@/src/store";

/**
 * Delegated Access Card Component
 */
interface DelegatedAccessCardProps {
  delegation: DelegatedAccessI;
  onWithdraw?: (id: number) => void;
}

const DelegatedAccessCard = ({
  delegation,
  onWithdraw,
}: DelegatedAccessCardProps) => {
  const user = delegation.delegatedUser;
  const initials = getInitials(user.name);

  return (
    <div className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-12 w-12 border-2 border-pale rounded-full flex items-center justify-center bg-pale-primary flex-shrink-0">
            <span className="text-primary font-semibold text-sm">
              {initials}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-[1rem] font-[600] mb-1">{user.name}</h3>
            <p className="text-[0.8125rem] opacity-60">{user.email}</p>
          </div>
        </div>
        {delegation.isActive && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Active
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-[0.8125rem] opacity-60">
          <span className="font-medium">Role:</span> Delegated Admin
        </p>
        <p className="text-[0.8125rem] opacity-60">
          <span className="font-medium">Organization:</span>{" "}
          {delegation.organization.name}
        </p>
        <p className="text-[0.8125rem] opacity-60">
          <span className="font-medium">Granted:</span>{" "}
          {new Date(delegation.createdAt).toLocaleDateString()}
        </p>
      </div>

      {onWithdraw && delegation.isActive && (
        <div className="flex gap-2 pt-4 border-t border-custom" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={() => onWithdraw(delegation.id)}
            className="bg-primary flex-1 text-[0.875rem] py-2.5"
          >
            <UserX size={16} className="mr-2" />
            Withdraw Access
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * University Admin Delegated Access - manage delegated users
 */
export default function UniversityAdminDelegatedAccess() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuthStore();
  const router = useRouter();
  const [delegations, setDelegations] = useState<DelegatedAccessI[]>([]);
  const [loading, setLoading] = useState(true);

  // Prevent delegated-admin users from accessing this page
  useEffect(() => {
    if (user?.role === "delegated-admin") {
      router.push("/university-admin");
    }
  }, [user?.role, router]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [delegationToDelete, setDelegationToDelete] = useState<number | null>(
    null
  );
  const [inviting, setInviting] = useState(false);

  const [inviteForm, setInviteForm] = useState<CreateDelegatedAccessRequest>({
    email: "",
    name: "",
  });

  const [formErrors, setFormErrors] = useState<{
    email?: string;
    name?: string;
  }>({});

  /**
   * Fetch delegated users
   */
  const fetchDelegations = async () => {
    try {
      setLoading(true);
      const data = await delegatedAccessRepository.getAll();
      setDelegations(data);
    } catch (error) {
      console.error("Failed to fetch delegations:", error);
      showError("Failed to load delegated users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelegations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Validate invite form
   */
  const validateForm = (): boolean => {
    const errors: { email?: string; name?: string } = {};

    if (!inviteForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
      errors.email = "Invalid email format";
    }

    if (!inviteForm.name.trim()) {
      errors.name = "Name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle invite submission
   */
  const handleInvite = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setInviting(true);
      await delegatedAccessRepository.create({
        email: inviteForm.email.trim().toLowerCase(),
        name: inviteForm.name.trim(),
      });
      showSuccess("Delegated access granted. Credentials sent via email.");
      setShowInviteModal(false);
      setInviteForm({ email: "", name: "" });
      setFormErrors({});
      fetchDelegations();
    } catch (error: any) {
      console.error("Failed to create delegation:", error);
      const message =
        error?.response?.data?.msg || "Failed to grant delegated access";
      showError(message);
    } finally {
      setInviting(false);
    }
  };

  /**
   * Handle withdraw access
   */
  const handleWithdraw = async () => {
    if (!delegationToDelete) return;

    try {
      await delegatedAccessRepository.delete(delegationToDelete);
      showSuccess("Delegated access withdrawn successfully");
      setShowDeleteConfirm(false);
      setDelegationToDelete(null);
      fetchDelegations();
    } catch (error) {
      console.error("Failed to withdraw access:", error);
      showError("Failed to withdraw access");
    }
  };

  // Don't render for delegated-admin users
  if (user?.role === "delegated-admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-full">
        <div className="flex items-center justify-center h-full">
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-[1rem] font-[600] mb-2">Delegated Access</h1>
            <p className="text-[0.875rem] opacity-60">
              Manage users who have delegated access to your university admin
              dashboard
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-primary text-white flex items-center gap-2"
          >
            <Plus size={18} />
            Invite User
          </Button>
        </div>
      </div>

      {/* Delegated Users List */}
      {delegations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <UserCheck size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-[0.875rem] opacity-60 mb-4">
              No delegated users yet
            </p>
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-primary text-white"
            >
              <Plus size={18} className="mr-2" />
              Invite First User
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {delegations.map((delegation) => (
            <DelegatedAccessCard
              key={delegation.id}
              delegation={delegation}
              onWithdraw={(id) => {
                setDelegationToDelete(id);
                setShowDeleteConfirm(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        open={showInviteModal}
        handleClose={() => {
          setShowInviteModal(false);
          setInviteForm({ email: "", name: "" });
          setFormErrors({});
        }}
        title="Grant Delegated Access"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={inviteForm.name}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter full name"
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter email address"
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          <p className="text-sm opacity-60">
            A random password will be generated and sent to the user via email.
            They will have access to the same university admin dashboard.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setShowInviteModal(false);
                setInviteForm({ email: "", name: "" });
                setFormErrors({});
              }}
              className="bg-pale text-primary flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={inviting}
              className="bg-primary text-white flex-1"
            >
              {inviting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDelegationToDelete(null);
        }}
        onConfirm={handleWithdraw}
        title="Withdraw Delegated Access"
        message="Are you sure you want to withdraw this user's delegated access? They will no longer be able to access the university admin dashboard."
        confirmText="Withdraw Access"
        type="danger"
      />
    </div>
  );
}
