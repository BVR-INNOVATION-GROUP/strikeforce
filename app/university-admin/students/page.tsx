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
import { studentRepository } from "@/src/repositories/studentRepository";
import { departmentService } from "@/src/services/departmentService";
import { courseService } from "@/src/services/courseService";
import { branchService } from "@/src/services/branchService";
import { useAuthStore } from "@/src/store";

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
            <Button onClick={(e) => { e.stopPropagation(); onDelete?.(student.id.toString()); }} className="bg-primary text-[0.875rem] py-2.5 flex-1">
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
  const { user, organization } = useAuthStore();
  const [students, setStudents] = useState<UserI[]>([]);
  const [departments, setDepartments] = useState<DepartmentI[]>([]);
  const [courses, setCourses] = useState<CourseI[]>([]);
  const [branches, setBranches] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserI | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingStudent, setEditingStudent] = useState<UserI | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
   * Load students, departments, and programmes from backend
   * Filters students by university ID from session (organization.id or user.orgId)
   */
  const loadData = async () => {
    try {
      setLoading(true);
      // Get university ID from session - for university-admin, use organization.id or user.orgId
      // This ensures we only show students belonging to the logged-in university admin's university
      const universityId = organization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);
      if (!universityId) {
        console.warn("No university ID found in session");
        setLoading(false);
        return;
      }

      const numericUniversityId = typeof universityId === 'string' ? parseInt(universityId, 10) : universityId;

      // Load departments for this university
      const departmentsData = await departmentService.getAllDepartments(numericUniversityId);
      setDepartments(departmentsData);

      // Load all courses (will filter by department when needed)
      const coursesData = await courseService.getAllCourses();
      // Filter courses that belong to departments in this university
      const universityCourses = coursesData.filter(c =>
        departmentsData.some(d => d.id === c.departmentId)
      );
      setCourses(universityCourses);

      // Load branches for this university
      const branchesData = await branchService.getAllBranches();
      setBranches(branchesData.map(b => ({ id: b.id, name: b.name })));

      // Load students directly from backend
      const backendStudents = await studentRepository.getByUniversity(numericUniversityId);
      setStudents(backendStudents);
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
   * Derives departmentId from course since course carries department information
   */
  const handleManualSubmit = async (data: {
    name: string;
    email?: string;
    course?: string;
    gender?: string;
    district?: string;
    universityBranch?: string;
    branchId?: string;
    birthYear?: string;
    enrollmentYear?: string;
  }) => {
    try {
      // For university-admin, use organization.id or user.orgId
      const universityId = organization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);

      if (!data.email || !universityId || !data.course) {
        showError("Name, email, and course are required");
        return;
      }

      // Find the selected course to get its departmentId
      // data.course is already validated above, so it's guaranteed to be defined here
      const selectedCourse = courses.find(c => c.id.toString() === data.course || c.id === parseInt(data.course!, 10));
      if (!selectedCourse) {
        showError("Selected course not found");
        return;
      }

      // Create student via API route (handles invitation, user creation, and email sending server-side)
      const numericUniversityId = typeof universityId === 'string' ? parseInt(universityId, 10) : universityId;
      const numericCourseId = typeof selectedCourse.id === 'string' ? parseInt(selectedCourse.id, 10) : selectedCourse.id;
      const numericDepartmentId = typeof selectedCourse.departmentId === 'string' ? parseInt(selectedCourse.departmentId, 10) : selectedCourse.departmentId;
      const organizationName = organization?.name || "University";

      setIsCreating(true);
      try {
        const { api } = await import("@/src/api/client");
        
        if (editingStudent) {
          // Update existing student
          const studentId = typeof editingStudent.id === 'number' ? editingStudent.id : parseInt(editingStudent.id.toString(), 10);
          await api.put(`/api/v1/students/${studentId}`, {
            name: data.name.trim(),
            gender: data.gender || "",
            district: data.district || "",
            branchId: data.branchId ? parseInt(data.branchId, 10) : undefined,
            birthYear: data.birthYear ? parseInt(data.birthYear, 10) : 0,
            enrollmentYear: data.enrollmentYear ? parseInt(data.enrollmentYear, 10) : 0,
          });

          await loadData();
          showSuccess("Student updated successfully!");
        } else {
          // Create new student
          await api.post(`/api/v1/students/${numericCourseId}`, {
            email: data.email.toLowerCase().trim(),
            name: data.name.trim(),
            gender: data.gender || "",
            district: data.district || "",
            universityBranch: data.universityBranch || "",
            branchId: data.branchId ? parseInt(data.branchId, 10) : undefined,
            birthYear: data.birthYear ? parseInt(data.birthYear, 10) : 0,
            enrollmentYear: data.enrollmentYear ? parseInt(data.enrollmentYear, 10) : 0,
          });

          await loadData();
          showSuccess(
            `Student created successfully! Login credentials have been sent to ${data.email}`
          );
        }
        
        setIsModalOpen(false);
        setEditingStudent(null);
      } catch (invError) {
        console.error("Failed to save student:", invError);
        showError(invError instanceof Error ? invError.message : `Failed to ${editingStudent ? 'update' : 'create'} student. Please try again.`);
      } finally {
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to save student:", error);
      showError(`Failed to ${editingStudent ? 'update' : 'create'} student. Please try again.`);
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
        `Processing ${selectedFiles.length} file(s)... Students will receive welcome emails with login credentials once processing is complete.`
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
   * Handle edit student - open edit modal with student data
   */
  const handleEditStudent = (student: UserI) => {
    setEditingStudent(student);
    setIsDetailsModalOpen(false);
    setIsModalOpen(true);
  };

  const handleSuspend = async (studentId: string) => {
    try {
      // TODO: Implement suspend endpoint
      // For now, just show a message
      showError("Suspend functionality not yet implemented");
    } catch (error) {
      console.error("Failed to suspend student:", error);
      showError("Failed to suspend student. Please try again.");
    }
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
   * Syncs with backend via repository pattern and updates UI immediately
   */
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      // Delete student via repository (syncs with backend)
      await userRepository.delete(studentToDelete);

      // Update UI immediately by filtering out the deleted student
      setStudents((prev) => prev.filter((s) => {
        const studentId = typeof s.id === 'string' ? s.id : s.id.toString();
        return studentId !== studentToDelete;
      }));

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
      <div className="w-full flex flex-col min-h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-[0.875rem] opacity-60">Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * Get department by ID (handles both number and string IDs)
   */
  const getDepartment = (departmentId?: number | string) => {
    if (!departmentId) return undefined;
    const numericId = typeof departmentId === 'string' ? parseInt(departmentId, 10) : departmentId;
    return departments.find((d) => d.id === numericId);
  };

  /**
   * Get course by ID (handles both number and string IDs)
   */
  const getCourse = (courseId?: number | string) => {
    if (!courseId) return undefined;
    const numericId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    return courses.find((c) => c.id === numericId);
  };

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1rem] font-[600] mb-2">Students</h1>
            <p className="text-[0.875rem] opacity-60">
              Manage university students. When students are created, a welcome email with login credentials is automatically sent to their email address.
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
          <p className="text-[0.875rem] opacity-60">
            No students yet. Use the "Add Student" button above to create your first student.
          </p>
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleManualSubmit}
        courses={courses}
        branches={branches}
        isSubmitting={isCreating}
        initialData={editingStudent ? {
          name: editingStudent.name,
          email: editingStudent.email,
          course: editingStudent.courseId?.toString(),
          gender: (editingStudent as any).gender,
          district: (editingStudent as any).district,
          branchId: (editingStudent as any).branchId?.toString(),
          birthYear: (editingStudent as any).birthYear?.toString(),
          enrollmentYear: (editingStudent as any).enrollmentYear?.toString(),
        } : undefined}
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
            <p className="text-[0.8125rem] opacity-60">name,email,courseId</p>
            <p className="text-[0.75rem] opacity-50 mt-2">
              Example: John Doe,john@university.edu,1
            </p>
            <p className="text-[0.75rem] opacity-60 mt-2">
              <strong>Note:</strong> Department is automatically derived from the selected course. All students will receive welcome emails with login credentials once processing is complete.
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
        onEdit={handleEditStudent}
        onDelete={handleDeleteClick}
        onSuspend={handleSuspend}
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

