/**
 * Manual Entry Form Modal - for creating students, supervisors, departments, courses
 */
"use client";

import React, { useState } from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import ManualEntryFormFields from "./ManualEntryFormFields";
import { validateManualEntry, ValidationErrors, UploadType } from "@/src/utils/manualEntryValidation";

import { CourseI, DepartmentI } from "@/src/models/project";

export interface Props {
  open: boolean;
  uploadType: UploadType;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email?: string;
    course?: string;
    department?: string;
  }) => void;
  courses?: CourseI[]; // Courses for student selection (department is derived from course)
  departments?: DepartmentI[]; // Departments for supervisor selection
  isSubmitting?: boolean; // Loading state for submit button
}

/**
 * Form modal for manual entry
 */
const ManualEntryForm = ({ open, uploadType, onClose, onSubmit, courses = [], departments = [], isSubmitting = false }: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    course: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = (): boolean => {
    const validationErrors = validateManualEntry(formData, uploadType);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      name: formData.name,
      email: uploadType === "student" || uploadType === "supervisor" ? formData.email : undefined,
      course: uploadType === "student" ? formData.course : undefined,
      department: uploadType === "supervisor" ? formData.department : undefined,
    });

    // Reset form
    setFormData({ name: "", email: "", department: "", course: "" });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    setFormData({ name: "", email: "", department: "", course: "" });
    setErrors({});
  };

  return (
    <Modal
      title={`Create ${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}`}
      open={open}
      handleClose={handleClose}
      actions={[
        <Button key="cancel" onClick={handleClose} className="bg-pale text-primary">
          Cancel
        </Button>,
        <Button key="submit" onClick={handleSubmit} className="bg-primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create"}
        </Button>,
      ]}
    >
      <ManualEntryFormFields
        uploadType={uploadType}
        formData={formData}
        errors={errors}
        onFieldChange={(field, value) => {
          setFormData({ ...formData, [field]: value });
        }}
        onClearError={(field) => clearError(field as keyof ValidationErrors)}
        courses={courses}
        departments={departments}
      />
    </Modal>
  );
};

export default ManualEntryForm;

