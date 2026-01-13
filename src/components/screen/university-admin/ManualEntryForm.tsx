/**
 * Manual Entry Form Modal - for creating students, supervisors, departments, courses
 */
"use client";

import React, { useEffect, useMemo, useState } from "react";
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
    gender?: string;
    district?: string;
    universityBranch?: string;
    branchId?: string;
    birthYear?: string;
    enrollmentYear?: string;
  }) => void;
  courses?: CourseI[]; // Courses for student selection (department is derived from course)
  departments?: DepartmentI[]; // Departments for supervisor selection
  branches?: Array<{ id: number; name: string }>; // Branches for student selection
  isSubmitting?: boolean; // Loading state for submit button
  lockDepartmentId?: string | number;
  hideDepartmentField?: boolean;
  initialData?: {
    name?: string;
    email?: string;
    course?: string;
    department?: string;
    gender?: string;
    district?: string;
    branchId?: string;
    birthYear?: string;
    enrollmentYear?: string;
  }; // Initial data for editing
}

/**
 * Form modal for manual entry
 */
const ManualEntryForm = ({
  open,
  uploadType,
  onClose,
  onSubmit,
  courses = [],
  departments = [],
  branches = [],
  isSubmitting = false,
  lockDepartmentId,
  hideDepartmentField = false,
  initialData,
}: Props) => {
  const lockedDepartmentValue = useMemo(() => {
    if (lockDepartmentId === undefined || lockDepartmentId === null) return "";
    return typeof lockDepartmentId === "string" ? lockDepartmentId : lockDepartmentId.toString();
  }, [lockDepartmentId]);

  const buildInitialFormState = () => ({
    name: initialData?.name || "",
    email: initialData?.email || "",
    department: initialData?.department || lockedDepartmentValue,
    course: initialData?.course || "",
    gender: initialData?.gender || "",
    district: initialData?.district || "",
    universityBranch: "",
    branchId: initialData?.branchId || "",
    birthYear: initialData?.birthYear || "",
    enrollmentYear: initialData?.enrollmentYear || "",
  });
  const [formData, setFormData] = useState(buildInitialFormState);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Update form data when initialData changes (for editing) or when modal opens/closes
  useEffect(() => {
    if (open && initialData) {
      setFormData(buildInitialFormState());
    } else if (!open) {
      // Reset form when modal closes
      setFormData(buildInitialFormState());
      setErrors({});
    }
  }, [initialData, open]);

  useEffect(() => {
    if (lockedDepartmentValue) {
      setFormData((prev) => ({ ...prev, department: lockedDepartmentValue }));
    }
  }, [lockedDepartmentValue]);

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

  const resetForm = () => {
    setFormData(buildInitialFormState());
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      name: formData.name,
      email: uploadType === "student" || uploadType === "supervisor" ? formData.email : undefined,
      course: uploadType === "student" ? formData.course : undefined,
      department:
        uploadType === "supervisor"
          ? lockedDepartmentValue || formData.department
          : undefined,
      gender: uploadType === "student" ? formData.gender : undefined,
      district: uploadType === "student" ? formData.district : undefined,
      universityBranch: uploadType === "student" ? formData.universityBranch : undefined,
      branchId: uploadType === "student" ? formData.branchId : undefined,
      birthYear: uploadType === "student" ? formData.birthYear : undefined,
      enrollmentYear: uploadType === "student" ? formData.enrollmentYear : undefined,
    });

    resetForm();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const isEditing = Boolean(initialData);

  return (
    <Modal
      title={isEditing ? `Edit ${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}` : `Create ${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}`}
      open={open}
      handleClose={handleClose}
      actions={[
        <Button key="cancel" onClick={handleClose} className="bg-pale text-primary">
          Cancel
        </Button>,
        <Button key="submit" onClick={handleSubmit} className="bg-primary" loading={isSubmitting}>
          {isEditing ? "Update" : "Create"}
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
        branches={branches}
        hideDepartmentField={hideDepartmentField || Boolean(lockedDepartmentValue)}
      />
    </Modal>
  );
};

export default ManualEntryForm;

