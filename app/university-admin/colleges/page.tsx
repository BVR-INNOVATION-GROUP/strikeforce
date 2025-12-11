"use client";

import React, { useEffect, useState } from "react";
import Button from "@/src/components/core/Button";
import Input from "@/src/components/core/Input";
import Modal from "@/src/components/base/Modal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import DataTable from "@/src/components/base/DataTable";
import { Plus, Building2 } from "lucide-react";
import { CollegeI } from "@/src/models/college";
import { collegeService } from "@/src/services/collegeService";
import { useToast } from "@/src/hooks/useToast";
import Skeleton from "@/src/components/core/Skeleton";

export default function UniversityAdminColleges() {
  const { showError, showSuccess } = useToast();
  const [colleges, setColleges] = useState<CollegeI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<CollegeI | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [collegeToDelete, setCollegeToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    try {
      setLoading(true);
      const data = await collegeService.getAllColleges();
      setColleges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load colleges:", error);
      showError("Failed to load colleges");
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "College name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      if (editingCollege) {
        await collegeService.updateCollege(editingCollege.id, formData.name.trim());
        showSuccess("College updated successfully");
      } else {
        await collegeService.createCollege(formData.name.trim());
        showSuccess("College created successfully");
      }
      handleClose();
      await loadColleges();
    } catch (error: any) {
      console.error("Failed to save college:", error);
      showError(error?.message || "Failed to save college");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!collegeToDelete) return;
    try {
      await collegeService.deleteCollege(collegeToDelete);
      showSuccess("College deleted successfully");
      setShowDeleteConfirm(false);
      setCollegeToDelete(null);
      await loadColleges();
    } catch (error: any) {
      console.error("Failed to delete college:", error);
      showError(error?.message || "Failed to delete college");
    }
  };

  const handleCreate = () => {
    setEditingCollege(null);
    setFormData({ name: "" });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (college: CollegeI) => {
    setEditingCollege(college);
    setFormData({ name: college.name });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCollege(null);
    setFormData({ name: "" });
    setErrors({});
  };

  const handleDeleteClick = (collegeId: number) => {
    setCollegeToDelete(collegeId);
    setShowDeleteConfirm(true);
  };

  const tableColumns = [
    { key: "name", header: "College Name" },
    { key: "createdAt", header: "Created At" },
    { key: "updatedAt", header: "Updated At" },
  ];

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton width={200} height={32} rounded="md" className="mb-2" />
            <Skeleton width={400} height={16} rounded="md" />
          </div>
          <Skeleton width={160} height={40} rounded="md" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-paper rounded-lg border border-custom p-4">
          <Skeleton width={150} height={24} rounded="md" className="mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton width="30%" height={20} rounded="md" />
                <Skeleton width="25%" height={20} rounded="md" />
                <Skeleton width="25%" height={20} rounded="md" />
                <Skeleton width="20%" height={36} rounded="md" className="ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-default">Colleges</h1>
          <p className="text-sm text-secondary mt-1">
            Manage university colleges/faculties to organize departments.
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-primary">
          <Plus size={16} className="mr-2" />
          Add College
        </Button>
      </div>

      <div className="bg-paper rounded-lg border border-custom p-4">
        <h2 className="text-lg font-semibold text-default mb-4">All Colleges</h2>
        <DataTable
          data={colleges
            .filter((c) => c && c.id != null)
            .map((c) => ({
              id: String(c.id),
              name: c.name || "",
              createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
              updatedAt: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "",
            }))}
          columns={tableColumns}
          showActions={true}
          showCheckboxes={false}
          onEdit={(row) => {
            const college = colleges.find((c) => String(c.id) === row.id);
            if (college) {
              handleEdit(college);
            }
          }}
          onDelete={(row) => handleDeleteClick(Number(row.id))}
          emptyMessage="No colleges found. Create your first college to organize departments."
        />
      </div>

      <Modal
        title={editingCollege ? "Edit College" : "Create College"}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : editingCollege ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <Input
            title="College Name *"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            placeholder="e.g., College of Engineering"
            error={errors.name}
          />
          <div className="flex items-center gap-2 text-secondary text-sm">
            <Building2 size={16} />
            <span>Colleges group departments; add departments after creating colleges.</span>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        open={showDeleteConfirm}
        title="Delete College"
        message="Are you sure you want to delete this college? Departments linked to this college will block deletion."
        onConfirm={handleDelete}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCollegeToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

