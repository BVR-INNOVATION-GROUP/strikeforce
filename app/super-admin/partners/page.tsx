"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import DataTable from "@/src/components/base/DataTable";
import { Column } from "@/src/components/base/DataTable";
import BarChart from "@/src/components/base/BarChart";
import Select from "@/src/components/core/Select";
import { OptionI } from "@/src/components/core/Select";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { projectRepository } from "@/src/repositories/projectRepository";
import { OrganizationI } from "@/src/models/organization";
import { useToast } from "@/src/hooks/useToast";
import OrganizationDetailsModal from "@/src/components/screen/super-admin/organizations/OrganizationDetailsModal";
import AddOrganizationModal from "@/src/components/screen/super-admin/organizations/AddOrganizationModal";
import EditOrganizationModal from "@/src/components/screen/super-admin/organizations/EditOrganizationModal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { Building2, Plus, Filter, CheckCircle2, XCircle, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Partners Page - Stat cards, charts, table with filters
 */
export default function PartnersPage() {
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [projectCounts, setProjectCounts] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrg, setSelectedOrg] = useState<OrganizationI | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deapproveConfirmOpen, setDeapproveConfirmOpen] = useState(false);
  const [orgToDeapprove, setOrgToDeapprove] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<number | null>(null);
  const [addOrgModalOpen, setAddOrgModalOpen] = useState(false);
  const [editOrgModalOpen, setEditOrgModalOpen] = useState(false);
  const [orgToEdit, setOrgToEdit] = useState<OrganizationI | null>(null);

  const fetchOrganizations = async () => {
    try {
      const orgs = await organizationRepository.getAll();
      const partners = orgs.filter((org) => org.type === "PARTNER");
      setOrganizations(partners);
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      showError("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const result = await projectRepository.getAll({ limit: 500 });
      const map = new Map<number, number>();
      result.projects.forEach((p) => {
        map.set(p.partnerId, (map.get(p.partnerId) ?? 0) + 1);
      });
      setProjectCounts(map);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchOrganizations(), fetchProjects()]).finally(() => setLoading(false));
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

  const filteredOrganizations = useMemo(() => {
    if (!statusFilter) return organizations;
    return organizations.filter((org) => org.kycStatus === statusFilter);
  }, [organizations, statusFilter]);

  const statusOptions: OptionI[] = [
    { label: "All statuses", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  const stats = useMemo(() => ({
    total: organizations.length,
    pending: organizations.filter((o) => o.kycStatus === "PENDING").length,
    approved: organizations.filter((o) => o.kycStatus === "APPROVED").length,
    rejected: organizations.filter((o) => o.kycStatus === "REJECTED").length,
  }), [organizations]);

  const statusChartData = useMemo(() => [
    { name: "Pending", Count: stats.pending },
    { name: "Approved", Count: stats.approved },
    { name: "Rejected", Count: stats.rejected },
  ], [stats]);

  const projectsPerPartnerData = useMemo(() => {
    return organizations
      .map((o) => ({
        name: o.name,
        Projects: projectCounts.get(o.userId ?? 0) ?? projectCounts.get(o.id) ?? 0,
      }))
      .filter((r) => r.Projects > 0)
      .sort((a, b) => b.Projects - a.Projects)
      .slice(0, 10);
  }, [organizations, projectCounts]);

  const tableData = useMemo(
    () =>
      filteredOrganizations.map((o) => ({
        id: String(o.id),
        orgId: o.id,
        name: o.name,
        email: o.email,
        status: o.kycStatus,
        projects: projectCounts.get(o.userId ?? 0) ?? projectCounts.get(o.id) ?? 0,
        createdAt: o.createdAt,
      })),
    [filteredOrganizations, projectCounts]
  );

  const columns: Column<typeof tableData[0]>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => <StatusIndicator status={item.status} />,
    },
    { key: "projects", header: "Projects", sortable: true },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (item) => {
        const org = organizations.find((o) => o.id === item.orgId);
        if (!org) return null;
        const isPending = org.kycStatus === "PENDING";
        const isApproved = org.kycStatus === "APPROVED";
        const isProcessing = approving === org.id;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleViewDetails(org.id); }}
              className="p-1.5 rounded hover:bg-pale text-secondary"
              title="View details"
            >
              <Eye size={14} />
            </button>
            {isPending && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleApprove(org.id); }}
                  disabled={isProcessing}
                  className="p-1.5 rounded hover:bg-muted-green text-green-600 disabled:opacity-50"
                  title="Approve"
                >
                  {isProcessing && approving === org.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReject(org.id); }}
                  disabled={isProcessing}
                  className="p-1.5 rounded hover:bg-muted-red text-red-600 disabled:opacity-50"
                  title="Reject"
                >
                  {isProcessing && approving === org.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <XCircle size={14} />
                  )}
                </button>
              </>
            )}
            {isApproved && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDeapproveRequest(org.id); }}
                disabled={isProcessing}
                className="p-1.5 rounded hover:bg-pale text-amber-600 disabled:opacity-50 text-xs flex items-center gap-1"
                title="Deapprove"
              >
                {isProcessing && approving === org.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Deapprove"
                )}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleEditRequest(org.id); }}
              disabled={isProcessing}
              className="p-1.5 rounded hover:bg-pale text-secondary disabled:opacity-50"
              title="Edit"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteRequest(org.id); }}
              disabled={isProcessing}
              className="p-1.5 rounded hover:bg-pale text-primary disabled:opacity-50"
              title="Delete"
            >
              {isProcessing && approving === org.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
        );
      },
    },
  ];

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
        <div className="flex-shrink-0 mb-8">
          <Skeleton width={200} height={24} className="mb-2" />
          <Skeleton width={300} height={16} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Building2 size={20} />} title="Total Partners" value={stats.total} />
        <StatCard icon={<Building2 size={20} />} title="Pending" value={stats.pending} />
        <StatCard icon={<Building2 size={20} />} title="Approved" value={stats.approved} />
        <StatCard icon={<Building2 size={20} />} title="Rejected" value={stats.rejected} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="Partners by Status"
          data={statusChartData}
          bars={[{ key: "Count", label: "Count" }]}
        />
        <BarChart
          title="Projects per Partner (Top 10)"
          data={projectsPerPartnerData}
          bars={[{ key: "Projects", label: "Projects" }]}
        />
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="min-w-[180px]">
          <Select
            title="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(opt) => setStatusFilter(String(typeof opt === "object" ? (opt as OptionI).value : opt))}
            placeHolder="All statuses"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Partners</h2>
        <DataTable
          data={tableData}
          columns={columns}
          showCheckboxes={false}
          showActions={false}
          pageSize={10}
          emptyMessage="No partner organizations found"
          onRowClick={(row) => {
            router.push(`/super-admin/partners/${row.orgId}`);
          }}
        />
      </Card>

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

