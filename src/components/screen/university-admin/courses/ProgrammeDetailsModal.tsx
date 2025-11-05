/**
 * Programme Details Modal - Side panel for viewing programme details
 */
"use client";

import React, { useState } from "react";
import SideModal from "@/src/components/base/SideModal";
import Button from "@/src/components/core/Button";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { CourseI } from "@/src/models/project";
import { DepartmentI } from "@/src/models/project";
import { BookOpen, Calendar, Edit, Trash2 } from "lucide-react";

export interface Props {
  open: boolean;
  onClose: () => void;
  programme: CourseI | null;
  department?: DepartmentI;
  onEdit: (programme: CourseI) => void;
  onDelete: (programmeId: string) => void;
}

/**
 * Side modal for programme details
 */
const ProgrammeDetailsModal = ({
  open,
  onClose,
  programme,
  department,
  onEdit,
  onDelete,
}: Props) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!programme) return null;

  const handleEdit = () => {
    onEdit(programme);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(programme.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Programme Details"
    >
      <div className="flex flex-col gap-6">
        {/* Icon and Name */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-pale-primary rounded-lg">
            <BookOpen size={32} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[1.125rem] font-[600] mb-1">{programme.name}</h3>
            <p className="text-[0.875rem] opacity-60">Programme</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {department && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Department</p>
              </div>
              <p className="text-[0.875rem] opacity-60">
                {department.name}
              </p>
            </div>
          )}


          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Programme ID</p>
            </div>
            <p className="text-[0.875rem] opacity-60 font-mono">
              {programme.id}
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
        title="Delete Programme"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete this programme? This action cannot be undone.</p>
            <p className="text-[0.8125rem] opacity-75">All associated students and data will be affected.</p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </SideModal>
  );
};

export default ProgrammeDetailsModal;

