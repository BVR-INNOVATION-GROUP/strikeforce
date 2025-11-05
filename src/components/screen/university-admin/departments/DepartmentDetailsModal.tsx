/**
 * Department Details Modal - Side panel for viewing department details
 */
"use client";

import React, { useState } from "react";
import SideModal from "@/src/components/base/SideModal";
import Button from "@/src/components/core/Button";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { DepartmentI } from "@/src/models/project";
import { Building2, Calendar, Edit, Trash2 } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";

export interface Props {
  open: boolean;
  onClose: () => void;
  department: DepartmentI | null;
  onEdit: (department: DepartmentI) => void;
  onDelete: (departmentId: string) => void;
}

/**
 * Side modal for department details
 */
const DepartmentDetailsModal = ({
  open,
  onClose,
  department,
  onEdit,
  onDelete,
}: Props) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!department) return null;

  const handleEdit = () => {
    onEdit(department);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(department.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Department Details"
    >
      <div className="flex flex-col gap-6">
        {/* Icon and Name */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-pale-primary rounded-lg">
            <Building2 size={32} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[1.125rem] font-[600] mb-1">{department.name}</h3>
            <p className="text-[0.875rem] opacity-60">Department</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Created Date</p>
            </div>
            <p className="text-[0.875rem] opacity-60">
              {formatDateShort(department.createdAt)}
            </p>
          </div>

          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Department ID</p>
            </div>
            <p className="text-[0.875rem] opacity-60 font-mono">
              {department.id}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-custom">
          <Button
            onClick={handleEdit}
            className="bg-pale text-primary flex-1"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDeleteClick}
            className="bg-primary flex-1"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete this department? This action cannot be undone.</p>
            <p className="text-[0.8125rem] opacity-75">All associated programmes and data will be affected.</p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </SideModal>
  );
};

export default DepartmentDetailsModal;

