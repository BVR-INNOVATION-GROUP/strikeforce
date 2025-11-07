/**
 * Manual Entry Form Fields Component
 */
"use client";

import React from "react";
import Input from "@/src/components/core/Input";
import Select from "@/src/components/core/Select";
import { ValidationErrors } from "@/src/utils/manualEntryValidation";
import { UploadType } from "@/src/utils/manualEntryValidation";

export interface Props {
  uploadType: UploadType;
  formData: {
    name: string;
    email: string;
    department: string;
    course: string;
  };
  errors: ValidationErrors;
  onFieldChange: (field: string, value: string) => void;
  onClearError: (field: string) => void;
}

/**
 * Form fields for manual entry (students, supervisors, departments, courses)
 */
const ManualEntryFormFields = ({
  uploadType,
  formData,
  errors,
  onFieldChange,
  onClearError,
}: Props) => {
  return (
    <div className="space-y-4">
      <Input
        title="Name *"
        value={formData.name}
        onChange={(e) => {
          onFieldChange("name", e.target.value);
          onClearError("name");
        }}
        error={errors.name}
      />

      {(uploadType === "student" || uploadType === "supervisor") && (
        <Input
          title="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => {
            onFieldChange("email", e.target.value);
            onClearError("email");
          }}
          error={errors.email}
        />
      )}

      {uploadType === "student" && (
        <>
          <Select
            title="Department *"
            options={[
              { value: "cs", label: "Computer Science" },
              { value: "eng", label: "Engineering" },
            ]}
            value={formData.department}
            onChange={(option) => {
              const value =
                typeof option === "string"
                  ? option
                  : typeof option === "object" && "value" in option
                    ? String(option.value)
                    : "";
              onFieldChange("department", value);
              onClearError("department");
            }}
            placeHolder="Select department"
            error={errors.department}
          />
          <Select
            title="Course *"
            options={[
              { value: "cs101", label: "CS101" },
              { value: "cs201", label: "CS201" },
            ]}
            value={formData.course}
            onChange={(option) => {
              const value =
                typeof option === "string"
                  ? option
                  : typeof option === "object" && "value" in option
                    ? String(option.value)
                    : "";
              onFieldChange("course", value);
              onClearError("course");
            }}
            placeHolder="Select course"
            error={errors.course}
          />
        </>
      )}
    </div>
  );
};

export default ManualEntryFormFields;






