"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { OrganizationI } from "@/src/models/organization";
import { useToast } from "@/src/hooks/useToast";
import OrganizationCard from "@/src/components/screen/super-admin/organizations/OrganizationCard";
import OrganizationDetailsModal from "@/src/components/screen/super-admin/organizations/OrganizationDetailsModal";
import AddOrganizationModal from "@/src/components/screen/super-admin/organizations/AddOrganizationModal";
import EditOrganizationModal from "@/src/components/screen/super-admin/organizations/EditOrganizationModal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import Button from "@/src/components/core/Button";
import { Building2, Plus } from "lucide-react";

type FilterTab = "all" | "pending" | "approved" | "rejected";

/**
 * Partners Page - View and manage partner organizations only
 * PRD Reference: Section 4 - Super Admin approves organizations
 */
export default function PartnersPage() {
  const { showSuccess, showError } = useToast();
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedOrg, setSelectedOrg] = useState<OrganizationI | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deapproveConfirmOpen, setDeapproveConfirmOpen] = useState(false);
  const [orgToDeapprove, setOrgToDeapprove] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<number | null>(null);
  const [addOrgModalOpen, setAddOrgModalOpen] = useState(false);
  const [editOrgModalOpen, setEditOrgModalOpen] = useState(false);
  const [orgToEdit, setOrgToEdit] = useState<OrganizationI | null>(null);

  /**
   * Fetch organizations data
   */
  const fetchOrganizations = async () => {
    try {
      const orgs = await organizationRepository.getAll();
      // Filter only partner organizations
      const partners = orgs.filter((org) => org.type === "PARTNER");
      setOrganizations(partners);
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      showError("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle organization approval
   */
  const handleApprove = async (orgId: number) => {
    setApproving(orgId);
    try {
      const updated = await organizationRepository.update(orgId, {
        kycStatus: "APPROVED",
      });
      
      setOrganizations((prev) =>
        prev.map((org) => (org.id === orgId ? updated : org))
      );
      
      showSuccess(`${updated.name} has been approved`);
    } catch (error) {
      console.error("Failed to approve organization:", error);
      showError("Failed to approve organization. Please try again.");
    } finally {
      setApproving(null);
    }
  };

  /**
   * Handle organization rejection
   */
  const handleReject = async (orgId: number) => {
    setApproving(orgId);
    try {
      const updated = await organizationRepository.update(orgId, {
        kycStatus: "REJECTED",
      });
      
      setOrganizations((prev) =>
        prev.map((org) => (org.id === orgId ? updated : org))
      );
      
      showSuccess(`${updated.name} has been rejected`);
    } catch (error) {
      console.error("Failed to reject organization:", error);
      showError("Failed to reject organization. Please try again.");
    } finally {
      setApproving(null);
    }
  };

  /**
   * Handle deapproval request - opens confirmation modal
   */
  const handleDeapproveRequest = (orgId: number) => {
    setOrgToDeapprove(orgId);
    setDeapproveConfirmOpen(true);
  };

  /**
   * Handle deapproval confirmation
   * Changes KYC status from APPROVED to PENDING
   */
  const handleDeapprove = async () => {
    if (!orgToDeapprove) return;
    
    setApproving(orgToDeapprove);
    setDeapproveConfirmOpen(false);
    
    try {
      const org = organizations.find((o) => o.id === orgToDeapprove);
      const updated = await organizationRepository.update(orgToDeapprove, {
        kycStatus: "PENDING",
      });
      
      setOrganizations((prev) =>
        prev.map((org) => (org.id === orgToDeapprove ? updated : org))
      );
      
      showSuccess(`${org?.name || "Partner"} has been deapproved and set to pending review`);
    } catch (error) {
      console.error("Failed to deapprove organization:", error);
      showError("Failed to deapprove partner. Please try again.");
    } finally {
      setApproving(null);
      setOrgToDeapprove(null);
    }
  };

  /**
   * Handle view details
   */
  const handleViewDetails = (orgId: number) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setSelectedOrg(org);
      setDetailsModalOpen(true);
    }
  };

  /**
   * Handle edit request - opens edit modal
   */
  const handleEditRequest = (orgId: number) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setOrgToEdit(org);
      setEditOrgModalOpen(true);
    }
  };

  /**
   * Filter organizations by status
   */
  const filteredOrganizations = useMemo(() => {
    if (activeTab === "all") return organizations;
    return organizations.filter((org) => {
      const status = org.kycStatus.toLowerCase();
      return status === activeTab;
    });
  }, [organizations, activeTab]);

  /**
   * Get counts for each tab
   */
  const tabCounts = useMemo(() => {
    return {
      all: organizations.length,
      pending: organizations.filter((o) => o.kycStatus === "PENDING").length,
      approved: organizations.filter((o) => o.kycStatus === "APPROVED").length,
      rejected: organizations.filter((o) => o.kycStatus === "REJECTED").length,
    };
  }, [organizations]);

  /**
   * Handle delete request - opens confirmation modal
   */
  const handleDeleteRequest = (orgId: number) => {
    setOrgToDelete(orgId);
    setDeleteConfirmOpen(true);
  };

  /**
   * Handle delete confirmation
   */
  const handleDelete = async () => {
    if (!orgToDelete) return;
    
    setApproving(orgToDelete);
    setDeleteConfirmOpen(false);
    
    try {
      const org = organizations.find((o) => o.id === orgToDelete);
      await organizationRepository.delete(orgToDelete);
      
      setOrganizations((prev) =>
        prev.filter((org) => org.id !== orgToDelete)
      );
      
      showSuccess(`${org?.name || "Partner"} has been deleted`);
    } catch (error) {
      console.error("Failed to delete organization:", error);
      showError("Failed to delete partner. Please try again.");
    } finally {
      setApproving(null);
      setOrgToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-[0.875rem] opacity-60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[1rem] font-[600] mb-2">Partners</h1>
          <p className="text-[0.875rem] opacity-60">
            Manage partner organizations
          </p>
        </div>
        <Button
          onClick={() => setAddOrgModalOpen(true)}
          className="bg-primary text-white flex items-center gap-2 px-4 py-2"
        >
          <Plus size={16} />
          Add Partner
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-custom">
        {(
          [
            { key: "all" as FilterTab, label: "All" },
            { key: "pending" as FilterTab, label: "Pending" },
            { key: "approved" as FilterTab, label: "Approved" },
            { key: "rejected" as FilterTab, label: "Rejected" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-[0.875rem] font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {tab.label} ({tabCounts[tab.key]})
          </button>
        ))}
      </div>

      {/* Partners Grid */}
      {filteredOrganizations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-[0.875rem] opacity-60">
              No partner organizations found
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onApprove={handleApprove}
              onReject={handleReject}
              onDeapprove={handleDeapproveRequest}
              onDelete={handleDeleteRequest}
              onEdit={handleEditRequest}
              onViewDetails={handleViewDetails}
              approving={approving}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <OrganizationDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedOrg(null);
        }}
        organization={selectedOrg}
      />

      {/* Deapproval Confirmation Modal */}
      <ConfirmationDialog
        open={deapproveConfirmOpen}
        onClose={() => {
          setDeapproveConfirmOpen(false);
          setOrgToDeapprove(null);
        }}
        onConfirm={handleDeapprove}
        title="Deapprove Partner"
        message={
          <div className="space-y-2">
            <p>
              Are you sure you want to deapprove{" "}
              <strong>
                {organizations.find((o) => o.id === orgToDeapprove)?.name}
              </strong>
              ?
            </p>
            <p className="text-sm opacity-75">
              The partner's KYC status will be changed from APPROVED to PENDING.
              They will need to be re-approved to regain full access.
            </p>
          </div>
        }
        type="warning"
        confirmText="Deapprove"
        cancelText="Cancel"
        loading={approving === orgToDeapprove}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setOrgToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Partner"
        message={
          <div className="space-y-2">
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {organizations.find((o) => o.id === orgToDelete)?.name}
              </strong>
              ?
            </p>
            <p className="text-sm opacity-75">
              This action cannot be undone. All associated data will be permanently removed.
            </p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        loading={approving === orgToDelete}
      />

      {/* Add Organization Modal */}
      <AddOrganizationModal
        open={addOrgModalOpen}
        onClose={() => setAddOrgModalOpen(false)}
        onSuccess={() => {
          setLoading(true);
          fetchOrganizations();
        }}
        defaultType="PARTNER"
      />

      {/* Edit Organization Modal */}
      <EditOrganizationModal
        open={editOrgModalOpen}
        organization={orgToEdit}
        onClose={() => {
          setEditOrgModalOpen(false);
          setOrgToEdit(null);
        }}
        onSuccess={() => {
          setLoading(true);
          fetchOrganizations();
        }}
      />
    </div>
  );
}

