/**
 * Manual Entry Form Fields Component
 */
"use client";

import React from "react";
import Input from "@/src/components/core/Input";
import Select from "@/src/components/core/Select";
import { CourseI, DepartmentI } from "@/src/models/project";
import { ValidationErrors, UploadType } from "@/src/utils/manualEntryValidation";

export interface Props {
  uploadType: UploadType;
  formData: {
    name: string;
    email: string;
    department: string;
    course: string;
    gender?: string;
    district?: string;
    universityBranch?: string;
    branchId?: string;
    birthYear?: string;
    enrollmentYear?: string;
  };
  errors: ValidationErrors;
  onFieldChange: (field: string, value: string) => void;
  onClearError: (field: string) => void;
  courses?: CourseI[]; // Courses for student selection (department is derived from course)
  departments?: DepartmentI[]; // Departments for supervisor selection
  branches?: Array<{ id: number; name: string }>; // Branches for student selection
  hideDepartmentField?: boolean;
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
  courses = [],
  departments = [],
  branches = [],
  hideDepartmentField = false,
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
            title="Course *"
            options={courses.map((course) => ({
              value: course.id.toString(),
              label: course.name,
            }))}
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
          <Select
            title="Gender"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
              { value: "prefer-not-to-say", label: "Prefer not to say" },
            ]}
            value={formData.gender || ""}
            onChange={(option) => {
              const value =
                typeof option === "string"
                  ? option
                  : typeof option === "object" && "value" in option
                    ? String(option.value)
                    : "";
              onFieldChange("gender", value);
            }}
            placeHolder="Select gender"
          />
          <Input
            title="District/Location"
            value={formData.district || ""}
            onChange={(e) => {
              onFieldChange("district", e.target.value);
            }}
            placeholder="e.g., Kampala, Wakiso"
          />
          <Select
            title="University Branch"
            options={branches.map((branch) => ({
              value: branch.id.toString(),
              label: branch.name,
            }))}
            value={formData.branchId || ""}
            onChange={(option) => {
              const value =
                typeof option === "string"
                  ? option
                  : typeof option === "object" && "value" in option
                    ? String(option.value)
                    : "";
              onFieldChange("branchId", value);
            }}
            placeHolder="Select branch"
          />
          <Select
            title="Birth Year"
            searchable={true}
            options={(() => {
              const currentYear = new Date().getFullYear();
              const startYear = currentYear - 40; // 40 years ago (typical max age for students)
              const endYear = currentYear - 15; // 15 years ago (typical min age for students)
              const years = [];
              for (let year = endYear; year >= startYear; year--) {
                years.push({ value: year.toString(), label: year.toString() });
              }
              return years;
            })()}
            value={formData.birthYear || ""}
            onChange={(option) => {
              const value =
                typeof option === "string"
                  ? option
                  : typeof option === "object" && "value" in option
                    ? String(option.value)
                    : "";
              onFieldChange("birthYear", value);
            }}
            placeHolder="Type or select birth year"
          />
          <Select
            title="Enrollment Year *"
            searchable={true}
            options={(() => {
              const currentYear = new Date().getFullYear();
              const startYear = 2000;
              const endYear = currentYear + 1; // Allow next year for early enrollment
              const years = [];
              for (let year = endYear; year >= startYear; year--) {
                years.push({ value: year.toString(), label: year.toString() });
              }
              return years;
            })()}
            value={formData.enrollmentYear || ""}
            onChange={(option) => {
              const value =
                typeof option === "string"
                  ? option
                  : typeof option === "object" && "value" in option
                    ? String(option.value)
                    : "";
              onFieldChange("enrollmentYear", value);
              onClearError("enrollmentYear");
            }}
            placeHolder="Type or select enrollment year"
            error={errors.enrollmentYear}
          />
        </>
      )}

      {uploadType === "supervisor" && !hideDepartmentField && (
        <Select
          title="Department *"
          options={departments
            .filter((department) => department && department.id !== undefined && department.id !== null)
            .map((department) => ({
              value: department.id !== undefined && department.id !== null ? String(department.id) : "",
              label: department.name,
            }))}
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
      )}
    </div>
  );
};

export default ManualEntryFormFields;






