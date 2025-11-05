"use client";

import React, { useEffect, useState } from "react";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { DepartmentI } from "@/src/models/project";
import { Plus, Upload } from "lucide-react";
import Modal from "@/src/components/base/Modal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import Input from "@/src/components/core/Input";
import FileUpload from "@/src/components/base/FileUpload";
import DepartmentCard from "@/src/components/screen/university-admin/departments/DepartmentCard";
import DepartmentDetailsModal from "@/src/components/screen/university-admin/departments/DepartmentDetailsModal";
import { downloadDepartmentsTemplate } from "@/src/utils/csvTemplateDownload";
import { Download } from "lucide-react";

/**
 * University Admin Departments - manage university departments
 * PRD Reference: Section 4 - University Admin can add departments via manual/bulk uploads
 */
export default function UniversityAdminDepartments() {
  const { showSuccess, showError } = useToast();
  const [departments, setDepartments] = useState<DepartmentI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentI | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentI | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  /**
   * Load departments from API
   */
  const loadDepartments = async () => {
    try {
      setLoading(true);
      // In production, load from API
      // For now, use mock data
      const mockDepartments: DepartmentI[] = [
        { id: "1", universityId: "org-university-1", name: "Computer Science", createdAt: "2024-01-01T00:00:00Z" },
        { id: "2", universityId: "org-university-1", name: "Engineering", createdAt: "2024-01-01T00:00:00Z" },
        { id: "3", universityId: "org-university-1", name: "Business Administration", createdAt: "2024-01-01T00:00:00Z" },
      ];
      setDepartments(mockDepartments);
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
    const newErrors: { name?: string } = {};
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Department name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (editingDepartment) {
        // Update existing department
        setDepartments(
          departments.map((d) =>
            d.id === editingDepartment.id
              ? { ...d, name: formData.name }
              : d
          )
        );
        showSuccess("Department updated successfully");
      } else {
        // Create new department
        const newDepartment: DepartmentI = {
          id: `dept-${Date.now()}`,
          universityId: "org-university-1", // In production, get from auth
          name: formData.name,
          createdAt: new Date().toISOString(),
        };
        setDepartments([...departments, newDepartment]);
        showSuccess("Department created successfully");
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save department:", error);
      showError("Failed to save department. Please try again.");
    }
  };

  /**
   * Handle delete department click - show confirmation
   */
  const handleDeleteClick = (departmentId: string) => {
    setDepartmentToDelete(departmentId);
    setShowDeleteConfirm(true);
  };

  /**
   * Handle delete department confirmation
   */
  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      setDepartments(departments.filter((d) => d.id !== departmentToDelete));
      showSuccess("Department deleted successfully");
      setShowDeleteConfirm(false);
      setDepartmentToDelete(null);
    } catch (error) {
      console.error("Failed to delete department:", error);
      showError("Failed to delete department. Please try again.");
      setShowDeleteConfirm(false);
      setDepartmentToDelete(null);
    }
  };

  /**
   * Open edit modal
   */
  const handleEdit = (department: DepartmentI) => {
    setEditingDepartment(department);
    setFormData({ name: department.name });
    setIsModalOpen(true);
  };

  /**
   * Open create modal
   */
  const handleCreate = () => {
    setEditingDepartment(null);
    setFormData({ name: "" });
    setErrors({});
    setIsModalOpen(true);
  };

  /**
   * Open details modal
   */
  const handleViewDetails = (department: DepartmentI) => {
    setSelectedDepartment(department);
    setIsDetailsModalOpen(true);
  };

  /**
   * Close modal and reset form
   */
  const handleClose = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    setFormData({ name: "" });
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
          <p className="text-[0.875rem] opacity-60 mb-4">
            No departments yet. Create your first department to get started.
          </p>
          <Button onClick={handleCreate} className="bg-primary">
            <Plus size={16} className="mr-2" />
            Create Department
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onViewDetails={handleViewDetails}
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

      {/* Details Modal */}
      <DepartmentDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDepartment(null);
        }}
        department={selectedDepartment}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

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

