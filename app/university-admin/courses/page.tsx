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
import { courseService } from "@/src/services/courseService";
import { departmentService } from "@/src/services/departmentService";
import { useAuthStore } from "@/src/store";
import { readCSVFile, validateCoursesCSV } from "@/src/utils/csvParser";

/**
 * University Admin Programmes - manage programmes within departments
 * PRD Reference: Section 4 - University Admin can add programmes via manual/bulk uploads
 */
export default function UniversityAdminCourses() {
  const { showSuccess, showError } = useToast();
  const { user, organization } = useAuthStore();
  const [courses, setCourses] = useState<CourseI[]>([]);
  const [departments, setDepartments] = useState<DepartmentI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState<CourseI | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingCourse, setEditingCourse] = useState<CourseI | null>(null);

  // Debug effect to track modal state changes
  useEffect(() => {
    console.log('[DEBUG] isModalOpen state changed to:', isModalOpen);
    console.log('[DEBUG] departments.length:', departments.length);
    console.log('[DEBUG] editingCourse:', editingCourse);
  }, [isModalOpen, departments.length, editingCourse]);

  // Debug effect to track when Modal component renders
  useEffect(() => {
    console.log('[DEBUG] Component render - isModalOpen:', isModalOpen);
  });
  const [formData, setFormData] = useState({ name: "", departmentId: "" });
  const [errors, setErrors] = useState<{ name?: string; departmentId?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [programmeToDelete, setProgrammeToDelete] = useState<string | null>(null);

  useEffect(() => {
    // For university-admin, use organization.id or user.orgId
    const universityId = organization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);
    if (universityId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.orgId, user?.universityId, organization?.id]);

  /**
   * Load programmes and departments from backend
   */
  const loadData = async () => {
    try {
      setLoading(true);
      // For university-admin, use organization.id or user.orgId
      const universityId = organization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);
      if (!universityId) {
        setLoading(false);
        return;
      }

      const numericUniversityId = typeof universityId === 'string' ? parseInt(universityId, 10) : universityId;

      // Load departments for this university
      const departmentsData = await departmentService.getAllDepartments(numericUniversityId);
      setDepartments(departmentsData);

      // Load all courses, then filter by departments in this university
      const allCourses = await courseService.getAllCourses();
      const universityCourses = allCourses.filter(c =>
        departmentsData.some(d => d.id === c.departmentId)
      );
      setCourses(universityCourses);
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
  const getDepartmentName = (departmentId: string | number): string => {
    const numericId = typeof departmentId === 'string' ? parseInt(departmentId, 10) : departmentId;
    const dept = departments.find((d) => d.id === numericId);
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
      const departmentId = typeof formData.departmentId === 'string' ? parseInt(formData.departmentId, 10) : formData.departmentId;

      if (editingCourse) {
        // Update existing course
        await courseService.updateCourse(
          editingCourse.id,
          { name: formData.name, departmentId: departmentId }
        );
        showSuccess("Programme updated successfully");
        handleClose();
        // Force page reload after update to ensure consistency
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // Create new programme
        await courseService.createCourse({
          name: formData.name,
          departmentId: departmentId,
        });
        showSuccess("Programme created successfully");
        handleClose();
        // Force page reload after creation (with small delay to show success message)
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error("Failed to save programme:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to save programme: ${errorMessage}`);
    }
  };

  /**
   * Handle delete programme click - show confirmation
   */
  const handleDeleteClick = (courseId: string | number) => {
    const courseIdString = String(courseId);
    setProgrammeToDelete(courseIdString);
    setShowDeleteConfirm(true);
  };

  /**
   * Handle delete programme confirmation
   */
  const handleConfirmDelete = async () => {
    if (!programmeToDelete) return;

    try {
      await courseService.deleteCourse(programmeToDelete);
      showSuccess("Programme deleted successfully");
      setShowDeleteConfirm(false);
      setProgrammeToDelete(null);
      // Force page reload after deletion to ensure consistency
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Failed to delete programme:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to delete programme: ${errorMessage}`);
      setShowDeleteConfirm(false);
      setProgrammeToDelete(null);
    }
  };

  /**
   * Open edit modal
   */
  const handleEdit = (course: CourseI) => {
    console.log('[DEBUG] handleEdit called with course:', course);
    setEditingCourse(course);
    setFormData({
      name: course.name,
      departmentId: String(course.departmentId), // Convert to string for Select component
    });
    setErrors({});
    // Use direct state update like create button
    setIsModalOpen(true);
  };

  /**
   * Open create modal
   * Note: This function is kept for backward compatibility but the button now uses direct state update
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
   * Parses CSV file and creates courses in the database
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
      const file = selectedFiles[0];

      // Read and parse CSV file
      const parsedRows = await readCSVFile(file);

      // Validate CSV structure
      const validation = validateCoursesCSV(parsedRows);
      if (!validation.valid) {
        showError(`CSV validation failed:\n${validation.errors.join('\n')}`);
        return;
      }

      // Create courses from parsed data
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const row of parsedRows) {
        try {
          const departmentId = parseInt(row.departmentId, 10);

          // Check if department exists
          const departmentExists = departments.some(d => d.id === departmentId);
          if (!departmentExists) {
            errors.push(`Course "${row.name}": Department ID ${departmentId} not found`);
            errorCount++;
            continue;
          }

          // Create course
          await courseService.createCourse({
            name: row.name.trim(),
            departmentId: departmentId,
          });
          successCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push(`Course "${row.name}": ${errorMessage}`);
          errorCount++;
        }
      }

      // Show results
      if (errorCount === 0) {
        showSuccess(`Successfully created ${successCount} programme(s)`);
      } else if (successCount > 0) {
        showError(
          `Created ${successCount} programme(s), but ${errorCount} failed:\n${errors.join('\n')}`
        );
      } else {
        showError(`Failed to create programmes:\n${errors.join('\n')}`);
      }

      // Reset and reload
      setSelectedFiles([]);
      setIsBulkUploadModalOpen(false);
      await loadData(); // Reload to show new courses
    } catch (error) {
      console.error("Failed to upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to process upload: ${errorMessage}`);
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
            <Button
              onClick={(e) => {
                console.log('[DEBUG] Bulk Upload button clicked');
                console.log('[DEBUG] Departments length:', departments.length);
                e.preventDefault();
                e.stopPropagation();
                setIsBulkUploadModalOpen(true);
              }}
              className="bg-pale text-primary"
              disabled={departments.length === 0}
            >
              <Upload size={16} className="mr-2" />
              Bulk Upload
            </Button>
            <Button
              onClick={() => {
                setEditingCourse(null);
                setFormData({ name: "", departmentId: "" });
                setErrors({});
                setIsModalOpen(true);
              }}
              className="bg-primary"
              disabled={departments.length === 0}
              type="button"
            >
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
          <p className="text-[0.875rem] opacity-60">
            No programmes yet. Use the "Add Programme" button above to create your first programme.
          </p>
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
        handleClose={() => {
          console.log('[DEBUG] Modal handleClose called');
          handleClose();
        }}
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
            value={formData.departmentId || null}
            onChange={(value) => {
              // Handle both OptionI object and string/number values
              const departmentIdValue = typeof value === 'object' && value !== null
                ? String(value.value)
                : String(value);
              setFormData({ ...formData, departmentId: departmentIdValue });
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

