"use client";

import React, { useEffect, useState } from "react";
import Button from "@/src/components/core/Button";
import Select from "@/src/components/core/Select";
import { useToast } from "@/src/hooks/useToast";
import { CourseI } from "@/src/models/project";
import { DepartmentI } from "@/src/models/project";
import { Plus, Upload } from "lucide-react";
import Modal from "@/src/components/base/Modal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import Input from "@/src/components/core/Input";
import FileUpload from "@/src/components/base/FileUpload";
import CourseCard from "@/src/components/screen/university-admin/courses/CourseCard";
import ProgrammeDetailsModal from "@/src/components/screen/university-admin/courses/ProgrammeDetailsModal";
import { downloadProgrammesTemplate } from "@/src/utils/csvTemplateDownload";
import { Download } from "lucide-react";

/**
 * University Admin Programmes - manage programmes within departments
 * PRD Reference: Section 4 - University Admin can add programmes via manual/bulk uploads
 */
export default function UniversityAdminCourses() {
  const { showSuccess, showError } = useToast();
  const [courses, setCourses] = useState<CourseI[]>([]);
  const [departments, setDepartments] = useState<DepartmentI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState<CourseI | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingCourse, setEditingCourse] = useState<CourseI | null>(null);
  const [formData, setFormData] = useState({ name: "", departmentId: "" });
  const [errors, setErrors] = useState<{ name?: string; departmentId?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [programmeToDelete, setProgrammeToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Load programmes and departments
   */
  const loadData = async () => {
    try {
      setLoading(true);
      // In production, load from API
      // Mock data
      const mockDepartments: DepartmentI[] = [
        { id: "1", universityId: "org-university-1", name: "Computer Science", createdAt: "2024-01-01T00:00:00Z" },
        { id: "2", universityId: "org-university-1", name: "Engineering", createdAt: "2024-01-01T00:00:00Z" },
      ];
      setDepartments(mockDepartments);

      const mockCourses: CourseI[] = [
        { id: "1", departmentId: "1", name: "Bachelor of Computer Science", createdAt: "2024-01-01T00:00:00Z" },
        { id: "2", departmentId: "1", name: "Bachelor of Information Technology", createdAt: "2024-01-01T00:00:00Z" },
        { id: "3", departmentId: "1", name: "Bachelor of Software Engineering", createdAt: "2024-01-01T00:00:00Z" },
        { id: "4", departmentId: "2", name: "Bachelor of Engineering", createdAt: "2024-01-01T00:00:00Z" },
      ];
      setCourses(mockCourses);
    } catch (error) {
      console.error("Failed to load data:", error);
      showError("Failed to load programmes");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get department name by ID
   */
  const getDepartmentName = (departmentId: string): string => {
    const dept = departments.find((d) => d.id === departmentId);
    return dept?.name || "Unknown";
  };

  /**
   * Validate programme form
   */
  const validate = (): boolean => {
    const newErrors: { name?: string; departmentId?: string } = {};
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Programme name is required";
    }
    if (!formData.departmentId) {
      newErrors.departmentId = "Department is required";
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
      if (editingCourse) {
        // Update existing course
        setCourses(
          courses.map((c) =>
            c.id === editingCourse.id
              ? { ...c, name: formData.name, departmentId: formData.departmentId }
              : c
          )
        );
        showSuccess("Programme updated successfully");
      } else {
        // Create new programme
        const newCourse: CourseI = {
          id: `course-${Date.now()}`,
          departmentId: formData.departmentId,
          name: formData.name,
          createdAt: new Date().toISOString(),
        };
        setCourses([...courses, newCourse]);
        showSuccess("Programme created successfully");
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save programme:", error);
      showError("Failed to save programme. Please try again.");
    }
  };

  /**
   * Handle delete programme click - show confirmation
   */
  const handleDeleteClick = (courseId: string) => {
    setProgrammeToDelete(courseId);
    setShowDeleteConfirm(true);
  };

  /**
   * Handle delete programme confirmation
   */
  const handleConfirmDelete = async () => {
    if (!programmeToDelete) return;

    try {
      setCourses(courses.filter((c) => c.id !== programmeToDelete));
      showSuccess("Programme deleted successfully");
      setShowDeleteConfirm(false);
      setProgrammeToDelete(null);
    } catch (error) {
      console.error("Failed to delete programme:", error);
      showError("Failed to delete programme. Please try again.");
      setShowDeleteConfirm(false);
      setProgrammeToDelete(null);
    }
  };

  /**
   * Open edit modal
   */
  const handleEdit = (course: CourseI) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      departmentId: course.departmentId,
    });
    setIsModalOpen(true);
  };

  /**
   * Open create modal
   */
  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({ name: "", departmentId: "" });
    setErrors({});
    setIsModalOpen(true);
  };

  /**
   * Open details modal
   */
  const handleViewDetails = (programme: CourseI) => {
    setSelectedProgramme(programme);
    setIsDetailsModalOpen(true);
  };

  /**
   * Close modal and reset form
   */
  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setFormData({ name: "", departmentId: "" });
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
      // Parse CSV, create courses
      console.log("Bulk upload programmes:", selectedFiles);
      showSuccess(`Processing ${selectedFiles.length} file(s)... Programmes will be created once processing is complete.`);
      setSelectedFiles([]);
      setIsBulkUploadModalOpen(false);
      loadData(); // Reload to show new courses
    } catch (error) {
      console.error("Failed to upload:", error);
      showError("Failed to process upload. Please try again.");
    }
  };

  const departmentOptions = departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
  }));

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
            <h1 className="text-[1rem] font-[600] mb-2">Programmes</h1>
            <p className="text-[0.875rem] opacity-60">
              Manage programmes within departments. Programmes are required for student assignments and project assignments.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsBulkUploadModalOpen(true)} className="bg-pale text-primary" disabled={departments.length === 0}>
              <Upload size={16} className="mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={handleCreate} className="bg-primary" disabled={departments.length === 0}>
              <Plus size={16} className="mr-2" />
              Add Programme
            </Button>
          </div>
        </div>
        {departments.length === 0 && (
          <p className="text-[0.8125rem] text-warning mt-2">
            Create at least one department before adding programmes.
          </p>
        )}
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12 bg-paper rounded-lg">
          <p className="text-[0.875rem] opacity-60 mb-4">
            No programmes yet. Create your first programme to get started.
          </p>
          <Button onClick={handleCreate} className="bg-primary" disabled={departments.length === 0}>
            <Plus size={16} className="mr-2" />
            Create Programme
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              department={departments.find((d) => d.id === course.departmentId)}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editingCourse ? "Edit Programme" : "Create Programme"}
        open={isModalOpen}
        handleClose={handleClose}
        actions={[
          <Button key="cancel" onClick={handleClose} className="bg-pale text-primary">
            Cancel
          </Button>,
          <Button key="submit" onClick={handleSubmit} className="bg-primary">
            {editingCourse ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <Select
            title="Department *"
            options={departmentOptions}
            value={formData.departmentId}
            onChange={(value) => {
              setFormData({ ...formData, departmentId: value });
              if (errors.departmentId) {
                setErrors({ ...errors, departmentId: undefined });
              }
            }}
            placeHolder="Select department"
            error={errors.departmentId}
          />
          <Input
            title="Programme Name *"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            placeholder="e.g., Bachelor of Engineering (B.E.)"
            error={errors.name}
          />
          <p className="text-[0.8125rem] opacity-60">
            Programmes are assigned to students and used for project matching. Examples: Bachelor of Engineering (B.E.), Bachelor of Science (B.Sc.), etc.
          </p>
        </div>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Programmes"
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
                onClick={downloadProgrammesTemplate}
                className="bg-primary text-[0.8125rem] py-1.5 px-3"
              >
                <Download size={14} className="mr-1" />
                Download Template
              </Button>
            </div>
            <p className="text-[0.8125rem] opacity-60">name,departmentId</p>
            <p className="text-[0.75rem] opacity-50 mt-2">
              Example: Bachelor of Engineering,1
            </p>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <ProgrammeDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProgramme(null);
        }}
        programme={selectedProgramme}
        department={selectedProgramme ? departments.find((d) => d.id === selectedProgramme.departmentId) : undefined}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProgrammeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Programme"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete this programme? This action cannot be undone.</p>
            <p className="text-[0.8125rem] opacity-75">All associated students and data will be affected.</p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

