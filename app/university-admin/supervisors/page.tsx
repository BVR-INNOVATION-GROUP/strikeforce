"use client";

import React, { useEffect, useState } from "react";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { UserI } from "@/src/models/user";
import { DepartmentI } from "@/src/models/project";
import { Plus, Upload, UserCheck } from "lucide-react";
import Modal from "@/src/components/base/Modal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import FileUpload from "@/src/components/base/FileUpload";
import ManualEntryForm from "@/src/components/screen/university-admin/ManualEntryForm";
import SupervisorDetailsModal from "@/src/components/screen/university-admin/supervisors/SupervisorDetailsModal";
import { downloadSupervisorsTemplate } from "@/src/utils/csvTemplateDownload";
import { Download } from "lucide-react";
import { getInitials, hasAvatar } from "@/src/utils/avatarUtils";

/**
 * Supervisor Card Component - displays supervisor information in card format
 */
interface SupervisorCardProps {
  supervisor: UserI;
  department?: DepartmentI;
  onEdit?: (supervisor: UserI) => void;
  onDelete?: (supervisorId: string) => void;
  onViewDetails?: (supervisor: UserI) => void;
}

const SupervisorCard = ({ supervisor, department, onEdit, onDelete, onViewDetails }: SupervisorCardProps) => {
  const [imageError, setImageError] = React.useState(false);
  const avatarUrl = supervisor.profile?.avatar;
  const hasImage = hasAvatar(avatarUrl) && !imageError;
  const initials = getInitials(supervisor.name);

  return (
    <div 
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails?.(supervisor)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {hasImage ? (
            <img
              src={avatarUrl}
              alt={supervisor.name}
              className="h-12 w-12 border-2 border-pale rounded-full object-cover flex-shrink-0"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-12 w-12 border-2 border-pale rounded-full flex items-center justify-center bg-pale-primary flex-shrink-0">
              <span className="text-primary font-semibold text-sm">
                {initials}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-[1rem] font-[600] mb-1">{supervisor.name}</h3>
            <p className="text-[0.8125rem] opacity-60">{supervisor.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {department && (
          <p className="text-[0.8125rem] opacity-60">
            <span className="font-medium">Department:</span> {department.name}
          </p>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-2 pt-4 border-t border-custom" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <Button onClick={() => onEdit(supervisor)} className="bg-pale text-primary flex-1 text-[0.875rem] py-2.5">
              Edit
            </Button>
          )}
          {onDelete && (
            <Button onClick={() => onDelete(supervisor.id)} className="bg-primary flex-1 text-[0.875rem] py-2.5">
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * University Admin Supervisors - manage supervisors
 * PRD Reference: Section 4 - Supervisors can be added via manual/bulk uploads
 */
export default function UniversityAdminSupervisors() {
  const { showSuccess, showError } = useToast();
  const [supervisors, setSupervisors] = useState<UserI[]>([]);
  const [departments, setDepartments] = useState<DepartmentI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<UserI | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingSupervisor, setEditingSupervisor] = useState<UserI | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supervisorToDelete, setSupervisorToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Load supervisors and departments
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

      // Mock supervisors - in production, filter by role "supervisor"
      const mockSupervisors: UserI[] = [
        {
          id: "1",
          role: "supervisor",
          email: "supervisor1@university.edu",
          name: "Dr. Jane Smith",
          universityId: "org-university-1",
          departmentId: "1",
          profile: {},
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          role: "supervisor",
          email: "supervisor2@university.edu",
          name: "Prof. John Doe",
          universityId: "org-university-1",
          departmentId: "2",
          profile: {},
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      setSupervisors(mockSupervisors);
    } catch (error) {
      console.error("Failed to load data:", error);
      showError("Failed to load supervisors");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle manual entry submission
   */
  const handleManualSubmit = async (data: {
    name: string;
    email?: string;
    department?: string;
    course?: string;
  }) => {
    try {
      // In production, submit form data to API
      console.log("Manual submit supervisor:", data);
      showSuccess("Supervisor created successfully!");
      setIsModalOpen(false);
      loadData(); // Reload to show new supervisor
    } catch (error) {
      console.error("Failed to create supervisor:", error);
      showError("Failed to create supervisor. Please try again.");
    }
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
      // Parse CSV, create supervisors
      console.log("Bulk upload supervisors:", selectedFiles);
      showSuccess(`Processing ${selectedFiles.length} file(s)... Supervisors will be created once processing is complete.`);
      setSelectedFiles([]);
      setIsBulkUploadModalOpen(false);
      loadData(); // Reload to show new supervisors
    } catch (error) {
      console.error("Failed to upload:", error);
      showError("Failed to process upload. Please try again.");
    }
  };

  /**
   * Open details modal
   */
  const handleViewDetails = (supervisor: UserI) => {
    setSelectedSupervisor(supervisor);
    setIsDetailsModalOpen(true);
  };

  /**
   * Handle delete supervisor click - show confirmation
   */
  const handleDeleteClick = (supervisorId: string) => {
    setSupervisorToDelete(supervisorId);
    setShowDeleteConfirm(true);
  };

  /**
   * Handle delete supervisor confirmation
   */
  const handleConfirmDelete = async () => {
    if (!supervisorToDelete) return;

    try {
      setSupervisors(supervisors.filter((s) => s.id !== supervisorToDelete));
      showSuccess("Supervisor deleted successfully");
      setShowDeleteConfirm(false);
      setSupervisorToDelete(null);
    } catch (error) {
      console.error("Failed to delete supervisor:", error);
      showError("Failed to delete supervisor. Please try again.");
      setShowDeleteConfirm(false);
      setSupervisorToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        Loading...
      </div>
    );
  }

  const getDepartment = (departmentId?: string) => {
    return departments.find((d) => d.id === departmentId);
  };

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1rem] font-[600] mb-2">Supervisors</h1>
            <p className="text-[0.875rem] opacity-60">
              Manage university supervisors. Supervisors can receive student requests and review project submissions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsBulkUploadModalOpen(true)} className="bg-pale text-primary">
              <Upload size={16} className="mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary">
              <Plus size={16} className="mr-2" />
              Add Supervisor
            </Button>
          </div>
        </div>
      </div>

      {/* Supervisors Grid */}
      {supervisors.length === 0 ? (
        <div className="text-center py-12 bg-paper rounded-lg">
          <p className="text-[0.875rem] opacity-60 mb-4">
            No supervisors yet. Create your first supervisor to get started.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary">
            <Plus size={16} className="mr-2" />
            Create Supervisor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supervisors.map((supervisor) => (
            <SupervisorCard
              key={supervisor.id}
              supervisor={supervisor}
              department={getDepartment(supervisor.departmentId)}
              onDelete={handleDeleteClick}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Manual Entry Modal */}
      <ManualEntryForm
        open={isModalOpen}
        uploadType="supervisor"
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleManualSubmit}
      />

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Supervisors"
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
                onClick={downloadSupervisorsTemplate}
                className="bg-primary text-[0.8125rem] py-1.5 px-3"
              >
                <Download size={14} className="mr-1" />
                Download Template
              </Button>
            </div>
            <p className="text-[0.8125rem] opacity-60">name,email,departmentId</p>
            <p className="text-[0.75rem] opacity-50 mt-2">
              Example: Dr. Jane Smith,jane@university.edu,1
            </p>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <SupervisorDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSupervisor(null);
        }}
        supervisor={selectedSupervisor}
        department={selectedSupervisor ? getDepartment(selectedSupervisor.departmentId) : undefined}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSupervisorToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Supervisor"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete this supervisor? This action cannot be undone.</p>
            <p className="text-[0.8125rem] opacity-75">All associated projects and data will be affected.</p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

