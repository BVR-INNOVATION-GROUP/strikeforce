"use client";

import React, { useEffect, useState } from "react";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { UserI } from "@/src/models/user";
import { DepartmentI, CourseI } from "@/src/models/project";
import { Plus, Upload, User } from "lucide-react";
import Modal from "@/src/components/base/Modal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import Input from "@/src/components/core/Input";
import Select from "@/src/components/core/Select";
import FileUpload from "@/src/components/base/FileUpload";
import ManualEntryForm from "@/src/components/screen/university-admin/ManualEntryForm";
import StudentDetailsModal from "@/src/components/screen/university-admin/students/StudentDetailsModal";
import { downloadStudentsTemplate } from "@/src/utils/csvTemplateDownload";
import { Download } from "lucide-react";
import { getInitials, hasAvatar } from "@/src/utils/avatarUtils";

/**
 * Student Card Component - displays student information in card format
 */
interface StudentCardProps {
  student: UserI;
  department?: DepartmentI;
  course?: CourseI;
  onEdit?: (student: UserI) => void;
  onDelete?: (studentId: string) => void;
  onViewDetails?: (student: UserI) => void;
}

const StudentCard = ({ student, department, course, onEdit, onDelete, onViewDetails }: StudentCardProps) => {
  const [imageError, setImageError] = React.useState(false);
  const avatarUrl = student.profile?.avatar;
  const hasImage = hasAvatar(avatarUrl) && !imageError;
  const initials = getInitials(student.name);

  return (
    <div
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails?.(student)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {hasImage ? (
            <img
              src={avatarUrl}
              alt={student.name}
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
            <h3 className="text-[1rem] font-[600] mb-1">{student.name}</h3>
            <p className="text-[0.8125rem] opacity-60">{student.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {department && (
          <p className="text-[0.8125rem] opacity-60">
            <span className="font-medium">Department:</span> {department.name}
          </p>
        )}
        {course && (
          <p className="text-[0.8125rem] opacity-60">
            <span className="font-medium">Programme:</span> {course.name}
          </p>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-2 pt-4 border-t border-custom" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <Button onClick={() => onEdit(student)} className="bg-pale text-primary flex-1 text-[0.875rem] py-2.5">
              Edit
            </Button>
          )}
          {onDelete && (
            <Button onClick={(e) => { e.stopPropagation(); onDelete?.(student.id); }} className="bg-primary flex-1 text-[0.875rem] py-2.5">
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * University Admin Students - manage students
 * PRD Reference: Section 4 - Students receive invitation links when created
 */
export default function UniversityAdminStudents() {
  const { showSuccess, showError } = useToast();
  const [students, setStudents] = useState<UserI[]>([]);
  const [departments, setDepartments] = useState<DepartmentI[]>([]);
  const [courses, setCourses] = useState<CourseI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserI | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingStudent, setEditingStudent] = useState<UserI | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Load students, departments, and programmes
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
      ];
      setCourses(mockCourses);

      // Mock students - in production, filter by role "student"
      const mockStudents: UserI[] = [
        {
          id: "1",
          role: "student",
          email: "student1@university.edu",
          name: "John Doe",
          universityId: "org-university-1",
          departmentId: "1",
          courseId: "1",
          profile: {},
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          role: "student",
          email: "student2@university.edu",
          name: "Jane Smith",
          universityId: "org-university-1",
          departmentId: "1",
          courseId: "2",
          profile: {},
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      setStudents(mockStudents);
    } catch (error) {
      console.error("Failed to load data:", error);
      showError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle manual entry submission
   * PRD Reference: Section 4 - Students receive invitation links when created
   */
  const handleManualSubmit = async (data: {
    name: string;
    email?: string;
    department?: string;
    course?: string;
  }) => {
    try {
      // In production, submit form data to API
      console.log("Manual submit student:", data);

      // If creating a student, send invitation email
      if (data.email) {
        const { invitationService } = await import("@/src/services/invitationService");

        const universityId = "org-university-1"; // Mock - get from auth

        try {
          const invitation = await invitationService.generateInvitation(
            data.email,
            "student",
            universityId,
            7 // 7 days expiry
          );

          const invitationLink = invitationService.generateInvitationLink(invitation.token);

          // In production, send email with invitation link
          showSuccess(
            `Student created successfully! Welcome email with invitation link has been sent to ${data.email}`
          );
        } catch (invError) {
          console.error("Failed to send invitation:", invError);
          showError("Student created but failed to send invitation email. Please try again.");
          return;
        }
      } else {
        showSuccess("Student created successfully!");
      }

      setIsModalOpen(false);
      loadData(); // Reload to show new student
    } catch (error) {
      console.error("Failed to create student:", error);
      showError("Failed to create student. Please try again.");
    }
  };

  /**
   * Handle bulk upload
   * PRD Reference: Section 4 - When students are uploaded via CSV, invitation emails are sent to all
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
      // In production, process CSV files
      // Parse CSV, create accounts, generate invitations, send emails
      console.log("Bulk upload students:", selectedFiles);
      showSuccess(
        `Processing ${selectedFiles.length} file(s)... Students will receive welcome emails with invitation links once processing is complete.`
      );
      setSelectedFiles([]);
      setIsBulkUploadModalOpen(false);
      loadData(); // Reload to show new students
    } catch (error) {
      console.error("Failed to upload:", error);
      showError("Failed to process upload. Please try again.");
    }
  };

  /**
   * Open details modal
   */
  const handleViewDetails = (student: UserI) => {
    setSelectedStudent(student);
    setIsDetailsModalOpen(true);
  };

  /**
   * Handle delete student click - show confirmation
   */
  const handleDeleteClick = (studentId: string) => {
    setStudentToDelete(studentId);
    setShowDeleteConfirm(true);
  };

  /**
   * Handle delete student confirmation
   */
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setStudents(students.filter((s) => s.id !== studentToDelete));
      showSuccess("Student deleted successfully");
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Failed to delete student:", error);
      showError("Failed to delete student. Please try again.");
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
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

  const getCourse = (courseId?: string) => {
    return courses.find((c) => c.id === courseId);
  };

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1rem] font-[600] mb-2">Students</h1>
            <p className="text-[0.875rem] opacity-60">
              Manage university students. When students are created, a welcome email with an invitation link is automatically sent to their email address.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsBulkUploadModalOpen(true)} className="bg-pale text-primary">
              <Upload size={16} className="mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary">
              <Plus size={16} className="mr-2" />
              Add Student
            </Button>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {students.length === 0 ? (
        <div className="text-center py-12 bg-paper rounded-lg">
          <p className="text-[0.875rem] opacity-60 mb-4">
            No students yet. Create your first student to get started.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary">
            <Plus size={16} className="mr-2" />
            Create Student
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              department={getDepartment(student.departmentId)}
              course={getCourse(student.courseId)}
              onDelete={handleDeleteClick}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Manual Entry Modal */}
      <ManualEntryForm
        open={isModalOpen}
        uploadType="student"
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleManualSubmit}
      />

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Students"
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
                onClick={downloadStudentsTemplate}
                className="bg-primary text-[0.8125rem] py-1.5 px-3"
              >
                <Download size={14} className="mr-1" />
                Download Template
              </Button>
            </div>
            <p className="text-[0.8125rem] opacity-60">name,email,departmentId,programmeId</p>
            <p className="text-[0.75rem] opacity-50 mt-2">
              Example: John Doe,john@university.edu,1,1
            </p>
            <p className="text-[0.75rem] opacity-60 mt-2">
              <strong>Note:</strong> All students will receive welcome emails with invitation links once processing is complete.
            </p>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <StudentDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        department={selectedStudent ? getDepartment(selectedStudent.departmentId) : undefined}
        programme={selectedStudent ? getCourse(selectedStudent.courseId) : undefined}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete this student? This action cannot be undone.</p>
            <p className="text-[0.8125rem] opacity-75">All associated projects and data will be removed.</p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

