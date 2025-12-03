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
  }) => void;
  courses?: CourseI[]; // Courses for student selection (department is derived from course)
  departments?: DepartmentI[]; // Departments for supervisor selection
  isSubmitting?: boolean; // Loading state for submit button
  lockDepartmentId?: string | number;
  hideDepartmentField?: boolean;
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
  isSubmitting = false,
  lockDepartmentId,
  hideDepartmentField = false,
}: Props) => {
  const lockedDepartmentValue = useMemo(() => {
    if (lockDepartmentId === undefined || lockDepartmentId === null) return "";
    return typeof lockDepartmentId === "string" ? lockDepartmentId : lockDepartmentId.toString();
  }, [lockDepartmentId]);

  const buildInitialFormState = () => ({
    name: "",
    email: "",
    department: lockedDepartmentValue,
    course: "",
  });
  const [formData, setFormData] = useState(buildInitialFormState);
  const [errors, setErrors] = useState<ValidationErrors>({});

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
    });

    resetForm();
  };

  const handleClose = () => {
    onClose();
    resetForm();
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
        hideDepartmentField={hideDepartmentField || Boolean(lockedDepartmentValue)}
      />
    </Modal>
  );
};

export default ManualEntryForm;

