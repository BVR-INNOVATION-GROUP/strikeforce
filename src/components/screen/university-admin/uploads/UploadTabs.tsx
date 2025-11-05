/**
 * Upload Tabs Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import Select from "@/src/components/core/Select";
import FileUpload from "@/src/components/base/FileUpload";
import { Upload, User } from "lucide-react";

export interface Props {
  activeTab: "manual" | "bulk";
  uploadType: "student" | "supervisor" | "department" | "course";
  selectedFiles: File[];
  onTabChange: (tab: "manual" | "bulk") => void;
  onUploadTypeChange: (type: "student" | "supervisor" | "department" | "course") => void;
  onFileSelect: (files: File[]) => void;
  onBulkUpload: () => void;
  onOpenManualModal: () => void;
}

/**
 * Tabs for manual entry vs bulk upload
 */
const UploadTabs = ({
  activeTab,
  uploadType,
  selectedFiles,
  onTabChange,
  onUploadTypeChange,
  onFileSelect,
  onBulkUpload,
  onOpenManualModal,
}: Props) => {
  const uploadTypeOptions = [
    { value: "student", label: "Student" },
    { value: "supervisor", label: "Supervisor" },
    { value: "department", label: "Department" },
    { value: "course", label: "Course" },
  ];

  const bulkUploadTypeOptions = [
    { value: "student", label: "Students (CSV)" },
    { value: "supervisor", label: "Supervisors (CSV)" },
    { value: "department", label: "Departments (CSV)" },
    { value: "course", label: "Courses (CSV)" },
  ];

  const handleUploadTypeChange = (option: any) => {
    const uploadTypeValue =
      typeof option === "string"
        ? option
        : typeof option === "object" && "value" in option
          ? String(option.value)
          : uploadType;
    if (
      uploadTypeValue === "student" ||
      uploadTypeValue === "supervisor" ||
      uploadTypeValue === "department" ||
      uploadTypeValue === "course"
    ) {
      onUploadTypeChange(uploadTypeValue);
    }
  };

  return (
    <Card>
      <div className="flex gap-4 border-b border-custom mb-4">
        <button
          onClick={() => onTabChange("manual")}
          className={`pb-2 px-4 ${
            activeTab === "manual"
              ? "border-b-2 border-primary text-primary font-semibold"
              : "text-secondary"
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => onTabChange("bulk")}
          className={`pb-2 px-4 ${
            activeTab === "bulk"
              ? "border-b-2 border-primary text-primary font-semibold"
              : "text-secondary"
          }`}
        >
          Bulk Upload
        </button>
      </div>

      {activeTab === "manual" ? (
        <div className="space-y-4">
          <Select
            title="Upload Type"
            options={uploadTypeOptions}
            value={uploadType}
            onChange={handleUploadTypeChange}
            placeHolder="Select upload type"
          />
          <Button onClick={onOpenManualModal} className="bg-primary">
            <User size={16} className="mr-2" />
            Create {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Select
            title="Upload Type"
            options={bulkUploadTypeOptions}
            value={uploadType}
            onChange={handleUploadTypeChange}
            placeHolder="Select upload type"
          />
          <FileUpload
            onFileSelect={onFileSelect}
            accept=".csv"
            multiple={false}
          />
          {selectedFiles.length > 0 && (
            <div className="p-4 bg-pale rounded-lg">
              <p className="text-sm font-medium mb-2">Selected File:</p>
              <p className="text-sm text-secondary">{selectedFiles[0].name}</p>
              <Button onClick={onBulkUpload} className="bg-primary mt-4">
                <Upload size={16} className="mr-2" />
                Upload CSV
              </Button>
            </div>
          )}
          <div className="mt-4 p-4 bg-pale rounded-lg">
            <p className="text-sm font-medium mb-2">CSV Template Format:</p>
            <p className="text-xs text-secondary">
              {uploadType === "student" && "name,email,departmentId,courseId"}
              {uploadType === "supervisor" && "name,email,departmentId"}
              {uploadType === "department" && "name,universityId"}
              {uploadType === "course" && "name,departmentId,year"}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UploadTabs;





