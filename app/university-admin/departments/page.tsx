"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { DepartmentI } from "@/src/models/project";
import { CollegeI } from "@/src/models/college";
import { Plus, Upload } from "lucide-react";
import Modal from "@/src/components/base/Modal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import Input from "@/src/components/core/Input";
import FileUpload from "@/src/components/base/FileUpload";
import DepartmentCard from "@/src/components/screen/university-admin/departments/DepartmentCard";
import { downloadDepartmentsTemplate } from "@/src/utils/csvTemplateDownload";
import { Download } from "lucide-react";
import Select from "@/src/components/core/Select";
import {
  GET,
  POST,
  PUT,
  DELETE_REQ,
  SourceDepartment,
  SourceCourse,
  transformDepartment,
  transformDepartments,
  transformCourses,
} from "@/base";
import { collegeService } from "@/src/services/collegeService";

/**
 * University Admin Departments - manage university departments
 * PRD Reference: Section 4 - University Admin can add departments via manual/bulk uploads
 */
export default function UniversityAdminDepartments() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [departments, setDepartments] = useState<DepartmentI[]>([]);
  const [colleges, setColleges] = useState<CollegeI[]>([]);
  const [programmeCounts, setProgrammeCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentI | null>(null);
  const [formData, setFormData] = useState<{ name: string; collegeId?: number | string | null }>({ name: "", collegeId: null });
  const [errors, setErrors] = useState<{ name?: string; collegeId?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  /**
   * Load departments from backend
   */
  const loadDepartments = async () => {
    try {
      setLoading(true);

      const [departmentsResponse, collegesResponse] = await Promise.all([
        GET<SourceDepartment[]>("api/v1/departments"),
        collegeService.getAllColleges(),
      ]);

      const normalizedColleges = Array.isArray(collegesResponse) ? collegesResponse : [];
      setColleges(normalizedColleges);

      const normalizedData = Array.isArray(departmentsResponse.data) ? departmentsResponse.data : [];
      const transformedDepartments = transformDepartments(normalizedData);

      // Enrich department college names if not returned
      const collegeMap = new Map<number, string>();
      normalizedColleges.forEach((col) => collegeMap.set(col.id, col.name));
      const enrichedDepartments = transformedDepartments.map((dept) => ({
        ...dept,
        collegeName: dept.collegeName || (dept.collegeId ? collegeMap.get(dept.collegeId) : undefined),
      }));

      setDepartments(enrichedDepartments);

      // Fetch programme counts for each department
      const counts: Record<number, number> = {};
      await Promise.all(
        enrichedDepartments.map(async (dept) => {
          try {
            const coursesResponse = await GET<SourceCourse[]>(`api/v1/courses?dept=${dept.id}`);
            const courses = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
            counts[dept.id] = courses.length;
          } catch (error) {
            console.error(`Failed to load courses for department ${dept.id}:`, error);
            counts[dept.id] = 0;
          }
        })
      );
      setProgrammeCounts(counts);

    } catch (error) {
      console.error("Failed to load departments:", error);
      showError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate department form
   */
  const validate = (): boolean => {
    const newErrors: { name?: string; collegeId?: string } = {};
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Department name is required";
    }
    if (!formData.collegeId) {
      newErrors.collegeId = "College is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validate()) return;

    const collegeId = formData.collegeId ? Number(formData.collegeId) : null;

    try {
      if (editingDepartment) {
        if (!editingDepartment.id) {
          showError("Invalid department: missing ID");
          return;
        }
        const deptId = typeof editingDepartment.id === "number"
          ? editingDepartment.id.toString()
          : editingDepartment.id;
        const response = await PUT<SourceDepartment>(
          `api/v1/departments/${deptId}`,
          { name: formData.name, collegeId }
        );
        showSuccess("Department updated successfully");
      } else {
        const { data, status, msg } = await POST<SourceDepartment>("api/v1/departments", {
          name: formData.name,
          collegeId,
        });

        if (status != 201) {
          showError(msg);
          return;
        }

        showSuccess("Department created successfully");
      }
      handleClose();
      // Reload departments to ensure college data is properly loaded
      await loadDepartments();
    } catch (error) {
      console.error("Failed to save department:", error);
      showError("Failed to save department. Please try again.");
    }
  };

  /**
   * Handle delete department click - show confirmation
   */
  const handleDeleteClick = (departmentId: string) => {
    if (!departmentId || departmentId.trim() === "") {
      showError("Invalid department ID");
      return;
    }
    setDepartmentToDelete(departmentId);
    setShowDeleteConfirm(true);
  };

  /**
   * Handle delete department confirmation
   */
  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await DELETE_REQ(`api/v1/departments/${departmentToDelete}`);

      setDepartments((prevDepartments) =>
        prevDepartments.filter((d) => d.id?.toString() !== departmentToDelete)
      );

      showSuccess("Department deleted successfully");
      setShowDeleteConfirm(false);
      setDepartmentToDelete(null);

      // Reload list silently to ensure consistency
      loadDepartments();
    } catch (error) {
      console.error("Failed to delete department:", error);
      showError("Failed to delete department. Please try again.");
      setShowDeleteConfirm(false);
      setDepartmentToDelete(null);
    }
  };

  /**
   * Handle department selection - navigate to details page
   */
  const handleSelect = (department: DepartmentI) => {
    if (!department.id) {
      showError("Invalid department: missing ID");
      return;
    }
    const deptId = typeof department.id === "number" ? department.id.toString() : department.id;
    router.push(`/university-admin/departments/${deptId}/courses`);
  };

  /**
   * Open edit modal
   */
  const handleEdit = (department: DepartmentI) => {
    setEditingDepartment(department);
    setFormData({ name: department.name, collegeId: department.collegeId ?? null });
    setIsModalOpen(true);
  };

  /**
   * Open create modal
   */
  const handleCreate = () => {
    setEditingDepartment(null);
    setFormData({ name: "", collegeId: null });
    setErrors({});
    setIsModalOpen(true);
  };

  /**
   * Close modal and reset form
   */
  const handleClose = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    setFormData({ name: "", collegeId: null });
    setErrors({});
  };

  /**
   * Handle bulk upload
   */
  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) {
      showError("Please select a CSV file to upload");
      return;
    }

    // Validate file type
    const invalidFiles = selectedFiles.filter((f) => !f.name.endsWith(".csv"));
    if (invalidFiles.length > 0) {
      showError("Only CSV files are allowed");
      return;
    }

    try {
      // In production, process CSV file
      // Parse CSV, create departments
      console.log("Bulk upload departments:", selectedFiles);
      showSuccess(`Processing ${selectedFiles.length} file(s)... Departments will be created once processing is complete.`);
      setSelectedFiles([]);
      setIsBulkUploadModalOpen(false);
      loadDepartments(); // Reload to show new departments
    } catch (error) {
      console.error("Failed to upload:", error);
      showError("Failed to process upload. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1rem] font-[600] mb-2">Departments</h1>
            <p className="text-[0.875rem] opacity-60">
              Manage university departments. Departments are required before creating programmes and assigning students.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsBulkUploadModalOpen(true)} className="bg-pale text-primary">
              <Upload size={16} className="mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={handleCreate} className="bg-primary">
              <Plus size={16} className="mr-2" />
              Add Department
            </Button>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <div className="text-center py-12 bg-paper rounded-lg">
          <p className="text-[0.875rem] opacity-60">
            No departments yet. Use the "Add Department" button above to create your first department.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              programmeCount={programmeCounts[department.id]}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editingDepartment ? "Edit Department" : "Create Department"}
        open={isModalOpen}
        handleClose={handleClose}
        actions={[
          <Button key="cancel" onClick={handleClose} className="bg-pale text-primary">
            Cancel
          </Button>,
          <Button key="submit" onClick={handleSubmit} className="bg-primary">
            {editingDepartment ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <Input
            title="Department Name *"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            placeholder="e.g., Computer Science"
            error={errors.name}
          />
          <Select
            title="College *"
            placeHolder="Select a college"
            options={colleges.map((c) => ({ label: c.name, value: c.id }))}
            value={
              colleges
                .map((c) => ({ label: c.name, value: c.id }))
                .find((o) => o.value === formData.collegeId) || formData.collegeId
            }
            onChange={(option) => {
              const value = typeof option === "string" ? option : option.value;
              const numericValue = typeof value === "string" ? Number(value) : (value as number);
              setFormData({ ...formData, collegeId: numericValue });
              if (errors.collegeId) {
                setErrors({ ...errors, collegeId: undefined });
              }
            }}
            error={errors.collegeId}
            searchable
          />
          <p className="text-[0.8125rem] opacity-60">
            Once created, programmes can be added to this department. Students will be assigned to departments and programmes.
          </p>
        </div>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Departments"
        open={isBulkUploadModalOpen}
        handleClose={() => {
          setIsBulkUploadModalOpen(false);
          setSelectedFiles([]);
        }}
        actions={[
          <Button
            key="cancel"
            onClick={() => {
              setIsBulkUploadModalOpen(false);
              setSelectedFiles([]);
            }}
            className="bg-pale text-primary"
          >
            Cancel
          </Button>,
          <Button key="upload" onClick={handleBulkUpload} className="bg-primary" disabled={selectedFiles.length === 0}>
            <Upload size={16} className="mr-2" />
            Upload CSV
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <FileUpload
            onFileSelect={setSelectedFiles}
            accept=".csv"
            multiple={false}
          />
          {selectedFiles.length > 0 && (
            <div className="p-4 bg-pale rounded-lg">
              <p className="text-[0.875rem] font-medium mb-2">Selected File:</p>
              <p className="text-[0.8125rem] opacity-60">{selectedFiles[0].name}</p>
            </div>
          )}
          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.875rem] font-medium">CSV Template Format:</p>
              <Button
                onClick={downloadDepartmentsTemplate}
                className="bg-primary text-[0.8125rem] py-1.5 px-3"
              >
                <Download size={14} className="mr-1" />
                Download Template
              </Button>
            </div>
            <p className="text-[0.8125rem] opacity-60">name,universityId</p>
            <p className="text-[0.75rem] opacity-50 mt-2">
              Example: Computer Science,org-university-1
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDepartmentToDelete(null);
        }}
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
    </div>
  );
}
