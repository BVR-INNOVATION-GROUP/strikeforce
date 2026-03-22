"use client";

import React, { useEffect, useState, useCallback } from "react";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { Plus, UserCheck, UserX, Shield } from "lucide-react";
import Modal from "@/src/components/base/Modal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import {
  SuperAdminDelegationI,
  CreateSuperAdminDelegationRequest,
} from "@/src/models/superAdminDelegation";
import { adminRepository } from "@/src/repositories/adminRepository";
import { getInitials } from "@/src/utils/avatarUtils";
import Skeleton from "@/src/components/core/Skeleton";

function DelegationCard({
  delegation,
  onWithdraw,
}: {
  delegation: SuperAdminDelegationI;
  onWithdraw?: (id: number) => void;
}) {
  const user = delegation.delegatedUser;
  const initials = getInitials(user.name);

  return (
    <div className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-12 w-12 border-2 border-pale rounded-full flex items-center justify-center bg-pale-primary flex-shrink-0">
            <span className="text-primary font-semibold text-sm">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[1rem] font-[600] mb-1 truncate">{user.name}</h3>
            <p className="text-[0.8125rem] opacity-60 truncate">{user.email}</p>
          </div>
        </div>
        {delegation.isActive && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium shrink-0">
            Active
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-[0.8125rem] opacity-60">
          <span className="font-medium">Role:</span> Super administrator
        </p>
        <p className="text-[0.8125rem] opacity-60">
          <span className="font-medium">Invited by:</span> {delegation.delegator.name}
        </p>
        <p className="text-[0.8125rem] opacity-60">
          <span className="font-medium">Recorded:</span>{" "}
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
            Remove delegation record
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminDelegatedAccessPage() {
  const { showSuccess, showError } = useToast();
  const [delegations, setDelegations] = useState<SuperAdminDelegationI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [delegationToDelete, setDelegationToDelete] = useState<number | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState<CreateSuperAdminDelegationRequest>({
    email: "",
    name: "",
  });
  const [formErrors, setFormErrors] = useState<{ email?: string; name?: string }>({});

  const fetchDelegations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminRepository.getSuperAdminDelegations();
      setDelegations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch super-admin delegations:", error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to load delegations";
      showError(message);
      setDelegations([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDelegations();
  }, [fetchDelegations]);

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

  const handleInvite = async () => {
    if (!validateForm()) return;
    try {
      setInviting(true);
      await adminRepository.createSuperAdminDelegation({
        email: inviteForm.email.trim().toLowerCase(),
        name: inviteForm.name.trim(),
      });
      showSuccess(
        "Delegation saved. New super admins receive credentials by email; existing super admins are linked without a new password."
      );
      setShowInviteModal(false);
      setInviteForm({ email: "", name: "" });
      setFormErrors({});
      fetchDelegations();
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        (error as { response?: { data?: { msg?: string } } })?.response?.data?.msg ||
        "Failed to create delegation";
      showError(message);
    } finally {
      setInviting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!delegationToDelete) return;
    try {
      await adminRepository.deleteSuperAdminDelegation(delegationToDelete);
      showSuccess("Delegation record removed");
      setShowDeleteConfirm(false);
      setDelegationToDelete(null);
      fetchDelegations();
    } catch (error) {
      console.error("Failed to remove delegation:", error);
      showError("Failed to remove delegation");
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-full">
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Delegated access</h1>
        <p className="text-[0.875rem] opacity-60 mb-4 max-w-2xl">
          Invite other <strong>super administrators</strong> to the platform. This is separate from
          partner or university delegated admins (those are managed from each org&apos;s own dashboard).
        </p>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-pale border border-custom mb-4 max-w-2xl">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-secondary">
            New users get a super-admin account and sign-in details by email. If the email already
            belongs to a super admin, only this delegation record is added. Removing a record does not
            delete their user account.
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-primary text-white flex items-center gap-2"
        >
          <Plus size={18} />
          Invite super administrator
        </Button>
      </div>

      {delegations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <UserCheck size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-[0.875rem] opacity-60 mb-4">
              You have not recorded any super-admin delegations yet.
            </p>
            <Button onClick={() => setShowInviteModal(true)} className="bg-primary text-white">
              <Plus size={18} className="mr-2" />
              Invite first super administrator
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {delegations.map((delegation) => (
            <DelegationCard
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

      <Modal
        open={showInviteModal}
        handleClose={() => {
          setShowInviteModal(false);
          setInviteForm({ email: "", name: "" });
          setFormErrors({});
        }}
        title="Invite super administrator"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Full name"
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Email address"
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>
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
              {inviting ? "Saving…" : "Send invitation"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDelegationToDelete(null);
        }}
        onConfirm={handleWithdraw}
        title="Remove delegation"
        message="Remove this delegation record? The user account stays; only your delegation entry is deleted."
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
}
