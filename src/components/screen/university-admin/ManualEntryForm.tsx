/**
 * Manual Entry Form Modal - for creating students, supervisors, departments, courses
 */
"use client";

import React, { useState } from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import ManualEntryFormFields from "./ManualEntryFormFields";
import { validateManualEntry, ValidationErrors, UploadType } from "@/src/utils/manualEntryValidation";

export interface Props {
  open: boolean;
  uploadType: UploadType;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email?: string;
    department?: string;
    course?: string;
  }) => void;
}

/**
 * Form modal for manual entry
 */
const ManualEntryForm = ({ open, uploadType, onClose, onSubmit }: Props) => {
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
      department: uploadType === "student" ? formData.department : undefined,
      course: uploadType === "student" ? formData.course : undefined,
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
        <Button key="submit" onClick={handleSubmit} className="bg-primary">
          Create
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
      />
    </Modal>
  );
};

export default ManualEntryForm;

