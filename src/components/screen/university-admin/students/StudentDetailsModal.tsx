/**
 * Student Details Modal - Side panel for viewing student details
 */
"use client";

import React, { useState } from "react";
import SideModal from "@/src/components/base/SideModal";
import Button from "@/src/components/core/Button";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { UserI } from "@/src/models/user";
import { DepartmentI, CourseI } from "@/src/models/project";
import { User, Mail, Calendar, Edit, Trash2, Building2, BookOpen } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";

export interface Props {
  open: boolean;
  onClose: () => void;
  student: UserI | null;
  department?: DepartmentI;
  programme?: CourseI;
  onEdit?: (student: UserI) => void;
  onDelete: (studentId: string) => void;
}

/**
 * Side modal for student details
 */
const StudentDetailsModal = ({
  open,
  onClose,
  student,
  department,
  programme,
  onEdit,
  onDelete,
}: Props) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!student) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(student);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(student.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Student Details"
    >
      <div className="flex flex-col gap-6">
        {/* Icon and Name */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-pale-primary rounded-lg">
            <User size={32} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[1.125rem] font-[600] mb-1">{student.name}</h3>
            <p className="text-[0.875rem] opacity-60">Student</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Email</p>
            </div>
            <p className="text-[0.875rem] opacity-60">
              {student.email}
            </p>
          </div>

          {department && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Department</p>
              </div>
              <p className="text-[0.875rem] opacity-60">
                {department.name}
              </p>
            </div>
          )}

          {programme && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Programme</p>
              </div>
              <p className="text-[0.875rem] opacity-60">
                {programme.name}
              </p>
            </div>
          )}

          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Created Date</p>
            </div>
            <p className="text-[0.875rem] opacity-60">
              {formatDateShort(student.createdAt)}
            </p>
          </div>

          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Student ID</p>
            </div>
            <p className="text-[0.875rem] opacity-60 font-mono">
              {student.id}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-custom">
          {onEdit && (
            <Button
              onClick={handleEdit}
              className="bg-pale text-primary flex-1"
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
          )}
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
        title="Delete Student"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete this student? This action cannot be undone.</p>
            <p className="text-[0.8125rem] opacity-75">All associated projects and data will be removed.</p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </SideModal>
  );
};

export default StudentDetailsModal;

