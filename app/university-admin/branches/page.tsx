"use client";

import React, { useEffect, useState } from "react";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import Modal from "@/src/components/base/Modal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import Input from "@/src/components/core/Input";
import StatCard from "@/src/components/core/StatCard";
import BarChart from "@/src/components/base/BarChart";
import { branchService, BranchI, BranchStats, BranchGraphData } from "@/src/services/branchService";
import DataTable from "@/src/components/base/DataTable";

/**
 * University Admin Branches - manage university branches/campuses
 */
export default function UniversityAdminBranches() {
  const { showSuccess, showError } = useToast();
  const [branches, setBranches] = useState<BranchI[]>([]);
  const [stats, setStats] = useState<BranchStats | null>(null);
  const [studentsByBranch, setStudentsByBranch] = useState<BranchGraphData[]>([]);
  const [projectsByBranch, setProjectsByBranch] = useState<BranchGraphData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchI | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Load all data (branches, stats, graphs)
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [branchesData, statsData, studentsData, projectsData] = await Promise.all([
        branchService.getAllBranches(),
        branchService.getBranchStats(),
        branchService.getStudentsByBranchData(),
        branchService.getProjectsByBranchData(),
      ]);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setStats(statsData);
      setStudentsByBranch(Array.isArray(studentsData) ? studentsData : []);
      setProjectsByBranch(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      showError("Failed to load branches data");
      setBranches([]);
      setStudentsByBranch([]);
      setProjectsByBranch([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate form
   */
  const validate = (): boolean => {
    const newErrors: { name?: string } = {};
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Branch name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submit (create or update)
   */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      if (editingBranch) {
        await branchService.updateBranch(editingBranch.id, formData.name.trim());
        showSuccess("Branch updated successfully");
      } else {
        await branchService.createBranch(formData.name.trim());
        showSuccess("Branch created successfully");
      }
      handleClose();
      await loadData();
    } catch (error: any) {
      console.error("Failed to save branch:", error);
      showError(error?.message || "Failed to save branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async () => {
    if (!branchToDelete) return;

    try {
      setIsDeleting(true);
      await branchService.deleteBranch(branchToDelete);
      showSuccess("Branch deleted successfully");
      setShowDeleteConfirm(false);
      setBranchToDelete(null);
      await loadData();
    } catch (error: any) {
      console.error("Failed to delete branch:", error);
      showError(error?.message || "Failed to delete branch");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Open create modal
   */
  const handleCreate = () => {
    setEditingBranch(null);
    setFormData({ name: "" });
    setErrors({});
    setIsModalOpen(true);
  };

  /**
   * Open edit modal
   */
  const handleEdit = (branch: BranchI) => {
    setEditingBranch(branch);
    setFormData({ name: branch.name });
    setErrors({});
    setIsModalOpen(true);
  };

  /**
   * Close modal
   */
  const handleClose = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setFormData({ name: "" });
    setErrors({});
  };

  /**
   * Handle delete click
   */
  const handleDeleteClick = (branchId: number) => {
    setBranchToDelete(branchId);
    setShowDeleteConfirm(true);
  };

  // Prepare bar chart data
  const studentsChartData = studentsByBranch.map((item) => ({
    name: item.branch || "Unknown",
    students: item.count,
  }));

  const projectsChartData = projectsByBranch.map((item) => ({
    name: item.branch || "Unknown",
    projects: item.count,
  }));

  // Create a map of branch name to student count
  const branchStudentCountMap = new Map<string, number>();
  studentsByBranch.forEach((item) => {
    if (item.branch) {
      branchStudentCountMap.set(item.branch, item.count);
    }
  });

  // Prepare table data
  const tableColumns = [
    { key: "name", header: "Branch Name" },
    { key: "studentCount", header: "Students" },
    { key: "createdAt", header: "Created At" },
    { key: "updatedAt", header: "Updated At" },
  ];

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-secondary">Loading branches...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-default">Branches</h1>
          <p className="text-sm text-secondary mt-1">
            Manage university branches and campuses
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-primary">
          <Plus size={16} className="mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Branches"
            value={stats.totalBranches.toString()}
            icon={<Building2 size={20} />}
            trend={null}
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents.toString()}
            icon={<Building2 size={20} />}
            trend={null}
          />
          <StatCard
            title="Total Projects"
            value={stats.totalProjects.toString()}
            icon={<Building2 size={20} />}
            trend={null}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Students by Branch"
          data={studentsChartData}
          bars={[
            { key: "students", label: "Students", color: "var(--primary)" },
          ]}
          height={300}
        />
        <BarChart
          title="Projects by Branch"
          data={projectsChartData}
          bars={[
            { key: "projects", label: "Projects", color: "var(--text-success)" },
          ]}
          height={300}
        />
      </div>

      {/* Branches Table */}
      <div className="bg-paper rounded-lg border border-custom p-4">
        <h2 className="text-lg font-semibold text-default mb-4">All Branches</h2>
        <DataTable
          data={branches
            .filter((b) => b && b.id != null)
            .map((b) => ({
              id: String(b.id),
              name: b.name || "",
              studentCount: branchStudentCountMap.get(b.name || "") || 0,
              createdAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "",
              updatedAt: b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : "",
            }))}
          columns={tableColumns}
          showActions={true}
          showCheckboxes={false}
          onEdit={(row) => {
            const branch = branches.find((b) => String(b.id) === row.id);
            if (branch) {
              handleEdit(branch);
            }
          }}
          emptyMessage="No branches found. Create your first branch to get started."
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={editingBranch ? "Edit Branch" : "Create Branch"}
        open={isModalOpen}
        handleClose={handleClose}
        actions={[
          <Button key="cancel" onClick={handleClose} className="bg-pale text-primary">
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={handleSubmit}
            className="bg-primary"
            loading={isSubmitting}
          >
            {editingBranch ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <Input
            title="Branch Name *"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            placeholder="e.g., Main Campus, Nakawa Branch"
            error={errors.name}
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        title="Delete Branch"
        message="Are you sure you want to delete this branch? This action cannot be undone. If students are associated with this branch, the deletion will be prevented."
        onConfirm={handleDelete}
        onClose={() => {
          setShowDeleteConfirm(false);
          setBranchToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}

