"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { CourseI, DepartmentI, ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import { Plus, Upload, ArrowLeft, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import Modal from "@/src/components/base/Modal";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import Input from "@/src/components/core/Input";
import FileUpload from "@/src/components/base/FileUpload";
import CourseCard from "@/src/components/screen/university-admin/courses/CourseCard";
import Card from "@/src/components/core/Card";
import { downloadProgrammesTemplate } from "@/src/utils/csvTemplateDownload";
import { readCSVFile, validateCoursesCSV } from "@/src/utils/csvParser";
import { courseService } from "@/src/services/courseService";
import { projectService } from "@/src/services/projectService";
import ManualEntryForm from "@/src/components/screen/university-admin/ManualEntryForm";
import { GET, POST, SourceDepartment, SourceCourse, transformDepartment, transformDepartments, transformCourses } from "@/base";
import { useAuthStore } from "@/src/store";
import { userRepository } from "@/src/repositories/userRepository";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { currenciesArray } from "@/src/constants/currencies";
import { stripHtmlTags } from "@/src/utils/htmlUtils";
import Link from "next/link";
import DashboardLoading from "@/src/components/core/DashboardLoading";

export default function DepartmentProgrammesPage() {
  const router = useRouter();
  const params = useParams<{ departmentId?: string | string[] }>();
  const { showSuccess, showError } = useToast();
  const { user, organization } = useAuthStore();
  const departmentId = useMemo(() => {
    const value = params?.departmentId;
    if (Array.isArray(value)) {
      return value[0] || "";
    }
    return value || "";
  }, [params?.departmentId]);

  const [department, setDepartment] = useState<DepartmentI | null>(null);
  const [courses, setCourses] = useState<CourseI[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingCourse, setEditingCourse] = useState<CourseI | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [programmeToDelete, setProgrammeToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"programmes" | "supervisors" | "projects">("programmes");
  const [supervisors, setSupervisors] = useState<Array<UserI & { supervisorRecordId?: number | string }>>([]);
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [isSupervisorCreating, setIsSupervisorCreating] = useState(false);
  const [showSupervisorDeleteConfirm, setShowSupervisorDeleteConfirm] = useState(false);
  const [supervisorToDelete, setSupervisorToDelete] = useState<(UserI & { supervisorRecordId?: number | string }) | null>(null);
  const [showSupervisorSuspendConfirm, setShowSupervisorSuspendConfirm] = useState(false);
  const [supervisorToSuspend, setSupervisorToSuspend] = useState<(UserI & { supervisorRecordId?: number | string }) | null>(null);
  const [isDeletingSupervisor, setIsDeletingSupervisor] = useState(false);
  const [isSuspendingSupervisor, setIsSuspendingSupervisor] = useState(false);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsLimit] = useState(12);
  const [projectsTotal, setProjectsTotal] = useState(0);
  const [projectsTotalPages, setProjectsTotalPages] = useState(1);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [updatingProjectStatus, setUpdatingProjectStatus] = useState<Record<string | number, boolean>>({});
  const buttonBaseClasses =
    "px-6 py-3 rounded flex gap-2 items-center justify-center min-w-max cursor-pointer";

  useEffect(() => {
    if (!departmentId || departmentId.trim() === "") {
      return;
    }
    loadData(departmentId);
  }, [departmentId]);

  useEffect(() => {
    if (activeTab === "projects" && department?.id) {
      loadProjects(department.id, projectsPage);
    }
  }, [activeTab, department?.id, projectsPage]);


  const loadSupervisors = async (deptNumericId: number) => {
    try {
      // Get supervisors by department
      const { api } = await import("@/src/api/client");
      const supervisorsData = await api.get<Array<{
        ID?: number;
        id?: number;
        userId?: number;
        user: UserI & { ID?: number };
        departmentId: number;
      }>>(`/api/v1/supervisors?dept=${deptNumericId}`);

      // Map supervisor records to include both user data and supervisor record ID
      const supervisorUsers = supervisorsData.map((s) => {
        const supervisorRecordId = s.ID || s.id;
        const user = s.user;
        // Normalize user ID (backend uses ID, frontend expects id)
        const normalizedUser: UserI & { supervisorRecordId?: number | string } = {
          ...user,
          id: user.ID || user.id,
          supervisorRecordId: supervisorRecordId,
        };
        return normalizedUser;
      });
      setSupervisors(supervisorUsers);
    } catch (error) {
      console.error("Failed to load supervisors:", error);
      showError("Failed to load supervisors for this department");
      setSupervisors([]);
    }
  };

  const loadProjects = async (deptNumericId: number, page: number) => {
    try {
      setProjectsLoading(true);
      const result = await projectService.getAllProjects({
        departmentId: deptNumericId,
        page: page,
        limit: projectsLimit,
      });
      setProjects(result.projects);
      setProjectsTotal(result.total);
      setProjectsTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to load projects:", error);
      showError("Failed to load projects for this department");
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadData = async (deptId: string) => {
    try {
      setLoading(true);
      const departmentsResponse = await GET<SourceDepartment[]>("api/v1/departments");
      const rawDepartments = Array.isArray(departmentsResponse.data) ? departmentsResponse.data : [];
      const normalizedDepartments = transformDepartments(rawDepartments);

      const numericDeptId = parseInt(deptId, 10);
      if (Number.isNaN(numericDeptId)) {
        showError("Invalid faculty identifier provided in the URL.");
        setDepartment(null);
        setCourses([]);
        return;
      }

      const matchingDepartment = normalizedDepartments.find((dept) => dept.id === numericDeptId) || null;
      if (!matchingDepartment) {
        showError("Faculty not found or no longer accessible.");
        setDepartment(null);
        setCourses([]);
        return;
      }

      setDepartment(matchingDepartment);

      const coursesResponse = await GET<SourceCourse[]>(`api/v1/courses?dept=${numericDeptId}`);
      const rawCourses = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
      const normalizedCourses = transformCourses(rawCourses);
      setCourses(normalizedCourses);
      await loadSupervisors(numericDeptId);

      // Fetch student counts for each course
      const counts: Record<number, number> = {};
      await Promise.all(
        normalizedCourses.map(async (course) => {
          try {
            const studentResponse = await GET<any[]>(`api/v1/students?course=${course.id}`);
            const students = Array.isArray(studentResponse.data) ? studentResponse.data : [];
            counts[course.id] = students.length;
          } catch (error) {
            console.error(`Failed to load students for course ${course.id}:`, error);
            counts[course.id] = 0;
          }
        })
      );
      setStudentCounts(counts);
    } catch (error) {
      console.error("Failed to load programmes:", error);
      showError("Failed to load programmes for this department");
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Programme name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resolveDepartmentId = (): number | null => {
    if (department?.id) return department.id;
    const parsed = parseInt(departmentId, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const resolvedDeptId = resolveDepartmentId();
    if (!resolvedDeptId) {
      showError("Faculty information is missing. Please refresh and try again.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCourse) {
        if (!editingCourse.id) {
          showError("Invalid programme: missing ID");
          return;
        }
        await courseService.updateCourse(editingCourse.id, {
          name: formData.name,
          departmentId: resolvedDeptId,
        });
        showSuccess("Programme updated successfully");
      } else {
        await POST<CourseI>("api/v1/courses", {
          department_id: resolvedDeptId,
          name: formData.name,
        });
        showSuccess("Programme created successfully");
      }
      handleClose();
      if (departmentId && departmentId.trim() !== "") {
        await loadData(departmentId);
      }
    } catch (error) {
      console.error("Failed to save programme:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to save programme: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (courseId: string | number) => {
    if (!courseId) {
      showError("Invalid programme ID");
      return;
    }
    const idStr = typeof courseId === "number" ? courseId.toString() : courseId;
    if (idStr.trim() === "") {
      showError("Invalid programme ID");
      return;
    }
    setProgrammeToDelete(idStr);
    setShowDeleteConfirm(true);
  };


  const handleConfirmDelete = async () => {
    if (!programmeToDelete || programmeToDelete.trim() === "") {
      showError("Invalid programme ID");
      return;
    }
    try {
      setIsDeleting(true);
      await courseService.deleteCourse(programmeToDelete);
      showSuccess("Programme deleted successfully");
      setShowDeleteConfirm(false);
      setProgrammeToDelete(null);
      if (departmentId && departmentId.trim() !== "") {
        await loadData(departmentId);
      }
    } catch (error) {
      console.error("Failed to delete programme:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to delete programme: ${errorMessage}`);
      setShowDeleteConfirm(false);
      setProgrammeToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (course: CourseI) => {
    setEditingCourse(course);
    setFormData({ name: course.name });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({ name: "" });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleViewDetails = (programme: CourseI) => {
    if (!departmentId || departmentId.trim() === "") {
      showError("Invalid department identifier");
      return;
    }
    if (programme.id === undefined || programme.id === null) {
      showError("Invalid programme identifier");
      return;
    }
    const deptId = departmentId.trim();
    const progId = typeof programme.id === "number" ? programme.id.toString() : String(programme.id);
    router.push(`/university-admin/departments/${deptId}/courses/${progId}/students`);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setFormData({ name: "" });
    setErrors({});
  };

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) {
      showError("Please select a CSV file to upload");
      return;
    }

    const invalidFiles = selectedFiles.filter((f) => !f.name.endsWith(".csv"));
    if (invalidFiles.length > 0) {
      showError("Only CSV files are allowed");
      return;
    }

    const resolvedDeptId = resolveDepartmentId();
    if (!resolvedDeptId) {
      showError("Faculty information is missing. Please refresh and try again.");
      return;
    }

    try {
      setIsBulkUploading(true);
      const file = selectedFiles[0];
      const parsedRows = await readCSVFile(file);
      const validation = validateCoursesCSV(parsedRows);
      if (!validation.valid) {
        showError(`CSV validation failed:\n${validation.errors.join("\n")}`);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const row of parsedRows) {
        try {
          const trimmedName = row.name.trim();
          if (!trimmedName) {
            errors.push("A row is missing a programme name");
            errorCount++;
            continue;
          }

          await courseService.createCourse({
            name: trimmedName,
            departmentId: resolvedDeptId,
          });
          successCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push(`Course "${row.name}": ${errorMessage}`);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        showSuccess(`Successfully created ${successCount} programme(s)`);
      } else if (successCount > 0) {
        showError(
          `Created ${successCount} programme(s), but ${errorCount} failed:\n${errors.join("\n")}`
        );
      } else {
        showError(`Failed to create programmes:\n${errors.join("\n")}`);
      }

      setSelectedFiles([]);
      setIsBulkUploadModalOpen(false);
      if (departmentId) {
        await loadData(departmentId);
      }
    } catch (error) {
      console.error("Failed to upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to process upload: ${errorMessage}`);
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleSupervisorModalOpen = () => {
    if (!department) {
      showError("Faculty information is missing. Please refresh and try again.");
      return;
    }
    setIsSupervisorModalOpen(true);
  };

  const handleSupervisorSubmit = async (data: { name: string; email?: string; department?: string }) => {
    const universityId = organization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);
    const resolvedDeptId = resolveDepartmentId();
    if (!data.name || !data.email || !universityId) {
      showError("Name, email, and university must be provided");
      return;
    }

    const numericUniversityId = typeof universityId === "string" ? parseInt(universityId, 10) : universityId;
    if (!numericUniversityId) {
      showError("University information missing. Please log in again.");
      return;
    }

    const numericDepartmentId = resolvedDeptId ? (typeof resolvedDeptId === "string" ? parseInt(resolvedDeptId, 10) : resolvedDeptId) : null;
    if (!numericDepartmentId) {
      showError("Department information is missing. Please refresh and try again.");
      return;
    }

    setIsSupervisorCreating(true);
    try {
      // Create supervisor directly via backend API - this will also send the password email
      const { api } = await import("@/src/api/client");
      await api.post(`/api/v1/supervisors/${numericDepartmentId}`, {
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
      });

      // Reload supervisors list
      if (resolvedDeptId) {
        await loadSupervisors(resolvedDeptId);
      }

      showSuccess(`Supervisor created successfully! Login credentials have been sent to ${data.email}`);
      setIsSupervisorModalOpen(false);
    } catch (error) {
      console.error("Failed to create supervisor:", error);
      showError(error instanceof Error ? error.message : "Failed to create supervisor. Please try again.");
    } finally {
      setIsSupervisorCreating(false);
    }
  };

  if (loading) {
    return <DashboardLoading />;
  }

  if (!departmentId) {
    return (
      <div className="w-full flex flex-col min-h-full items-center justify-center p-8 text-center">
        <p className="text-secondary">Missing department identifier. Please navigate from the departments dashboard.</p>
        <Button className="mt-4 bg-primary" onClick={() => router.push("/university-admin/departments")}>
          Go back to departments
        </Button>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="w-full flex flex-col min-h-full items-center justify-center p-8 text-center">
        <p className="text-secondary">Department not found. Please return to the departments list.</p>
        <Button className="mt-4 bg-primary" onClick={() => router.push("/university-admin/departments")}>
          Go back to departments
        </Button>
      </div>
    );
  }

  const scopedCourses = Array.isArray(courses) ? courses : [];
  const primaryActionLabel = activeTab === "programmes" ? "Add Programme" : activeTab === "supervisors" ? "Add Supervisor" : "";
  const handlePrimaryAction = () => {
    if (activeTab === "programmes") {
      handleCreate();
    } else if (activeTab === "supervisors") {
      handleSupervisorModalOpen();
    }
  };

  const handleProjectClick = (project: ProjectI) => {
    if (!project.id) {
      showError("Invalid project identifier");
      return;
    }
    const projectId = typeof project.id === "number" ? project.id.toString() : String(project.id);
    router.push(`/university-admin/projects/${projectId}`);
  };

  const handleApproveProject = async (project: ProjectI, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project.id) {
      showError("Invalid project identifier");
      return;
    }
    
    setUpdatingProjectStatus({ ...updatingProjectStatus, [project.id]: true });
    try {
      await projectService.updateProjectStatus(project.id, "published");
      showSuccess("Project approved successfully");
      // Reload projects
      if (department?.id) {
        await loadProjects(department.id, projectsPage);
      }
    } catch (error) {
      console.error("Failed to approve project:", error);
      showError(error instanceof Error ? error.message : "Failed to approve project");
    } finally {
      setUpdatingProjectStatus({ ...updatingProjectStatus, [project.id]: false });
    }
  };

  const handleDisapproveProject = async (project: ProjectI, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!project.id) {
      showError("Invalid project identifier");
      return;
    }
    
    setUpdatingProjectStatus({ ...updatingProjectStatus, [project.id]: true });
    try {
      await projectService.updateProjectStatus(project.id, "draft");
      showSuccess("Project disapproved successfully");
      // Reload projects
      if (department?.id) {
        await loadProjects(department.id, projectsPage);
      }
    } catch (error) {
      console.error("Failed to disapprove project:", error);
      showError(error instanceof Error ? error.message : "Failed to disapprove project");
    } finally {
      setUpdatingProjectStatus({ ...updatingProjectStatus, [project.id]: false });
    }
  };

  const getCurrencySymbol = (currency: string): string => {
    const currencyInfo = currenciesArray.find((c) => c.code === currency);
    return currencyInfo?.symbol || currency;
  };

  const getBudgetValue = (project: ProjectI): number => {
    if (typeof project.budget === 'number') {
      return project.budget;
    }
    if (project.budget && typeof project.budget === 'object' && !Array.isArray(project.budget)) {
      const budgetObj = project.budget as any;
      return budgetObj.Value !== undefined ? budgetObj.Value : (budgetObj.value !== undefined ? budgetObj.value : 0);
    }
    return 0;
  };

  const handleSupervisorClick = (supervisor: UserI & { supervisorRecordId?: number | string }) => {
    // Use supervisor record ID (not user ID) for navigation
    const supervisorRecordId = supervisor.supervisorRecordId;
    if (!supervisorRecordId) {
      showError("Invalid supervisor: missing supervisor record ID");
      return;
    }
    const supervisorId = typeof supervisorRecordId === "number" ? supervisorRecordId.toString() : supervisorRecordId;
    router.push(`/university-admin/supervisors/${supervisorId}`);
  };

  const handleSuspendSupervisor = async (supervisor: UserI & { supervisorRecordId?: number | string }, e: React.MouseEvent) => {
    e.stopPropagation();
    setSupervisorToSuspend(supervisor);
    setShowSupervisorSuspendConfirm(true);
  };

  const handleConfirmSuspend = async () => {
    const supervisorRecordId = supervisorToSuspend?.supervisorRecordId;
    if (!supervisorRecordId) {
      showError("Invalid supervisor: missing supervisor record ID");
      return;
    }

    try {
      setIsSuspendingSupervisor(true);
      const supervisorId = typeof supervisorRecordId === "number" ? supervisorRecordId.toString() : supervisorRecordId;
      const { api } = await import("@/src/api/client");
      await api.post(`/api/v1/supervisors/${supervisorId}/suspend`);

      showSuccess("Supervisor suspended successfully");
      setShowSupervisorSuspendConfirm(false);
      setSupervisorToSuspend(null);

      // Reload supervisors
      const resolvedDeptId = resolveDepartmentId();
      if (resolvedDeptId) {
        await loadSupervisors(resolvedDeptId);
      }
    } catch (error) {
      console.error("Failed to suspend supervisor:", error);
      showError(error instanceof Error ? error.message : "Failed to suspend supervisor. Please try again.");
      setShowSupervisorSuspendConfirm(false);
      setSupervisorToSuspend(null);
    } finally {
      setIsSuspendingSupervisor(false);
    }
  };

  const handleDeleteSupervisor = async (supervisor: UserI & { supervisorRecordId?: number | string }, e: React.MouseEvent) => {
    e.stopPropagation();
    setSupervisorToDelete(supervisor);
    setShowSupervisorDeleteConfirm(true);
  };

  const handleConfirmDeleteSupervisor = async () => {
    const supervisorRecordId = supervisorToDelete?.supervisorRecordId;
    if (!supervisorRecordId) {
      showError("Invalid supervisor: missing supervisor record ID");
      return;
    }

    try {
      setIsDeletingSupervisor(true);
      const supervisorId = typeof supervisorRecordId === "number" ? supervisorRecordId.toString() : supervisorRecordId;
      const { api } = await import("@/src/api/client");
      await api.delete(`/api/v1/supervisors/${supervisorId}`);

      showSuccess("Supervisor deleted successfully");
      setShowSupervisorDeleteConfirm(false);
      setSupervisorToDelete(null);

      // Reload supervisors
      const resolvedDeptId = resolveDepartmentId();
      if (resolvedDeptId) {
        await loadSupervisors(resolvedDeptId);
      }
    } catch (error) {
      console.error("Failed to delete supervisor:", error);
      showError(error instanceof Error ? error.message : "Failed to delete supervisor. Please try again.");
      setShowSupervisorDeleteConfirm(false);
      setSupervisorToDelete(null);
    } finally {
      setIsDeletingSupervisor(false);
    }
  };

  const renderSupervisors = () => {
    if (supervisors.length === 0) {
      return (
        <div className="text-center py-12 bg-paper rounded-lg">
          <p className="text-[0.875rem] opacity-60">
            No supervisors yet for {department.name}. Use the "Add Supervisor" button above to create one.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supervisors.map((supervisor) => {
          return (
            <div
              key={supervisor.id}
              onClick={() => handleSupervisorClick(supervisor)}
              className="bg-paper rounded-lg p-5 shadow-custom cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-[0.95rem] font-semibold mb-1">
                    {supervisor.name || supervisor.email.split("@")[0]}
                  </p>
                  <p className="text-[0.85rem] opacity-70 break-all">{supervisor.email}</p>
                </div>
                <span className="ml-2 px-2 py-1 text-[0.75rem] font-medium bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                  Active
                </span>
              </div>
              <div className="flex gap-2 pt-3 border-t border-custom mt-3" onClick={(e) => e.stopPropagation()}>
                <Button
                  onClick={(e) => handleSuspendSupervisor(supervisor, e)}
                  className="bg-pale text-primary flex-1 text-[0.875rem] py-2.5"
                >
                  Suspend
                </Button>
                <Button
                  onClick={(e) => handleDeleteSupervisor(supervisor, e)}
                  className="bg-primary text-[0.875rem] py-2.5 flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderProjects = () => {
    if (projectsLoading) {
      return (
        <div className="text-center py-12 bg-paper rounded-lg">
          <p className="text-[0.875rem] opacity-60">Loading projects...</p>
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div className="text-center py-12 bg-paper rounded-lg">
          <p className="text-[0.875rem] opacity-60">
            No projects yet for {department.name}.
          </p>
        </div>
      );
    }

    const normalizedStatus = (status: string) => (status || "").toLowerCase();
    const isPublished = (status: string) => normalizedStatus(status) === "published";

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const currencySymbol = getCurrencySymbol(project.currency);
            const projectIsPublished = isPublished(project.status);
            const isUpdating = updatingProjectStatus[project.id] || false;

            return (
              <Card key={project.id} className="hover:shadow-md transition-all border-0 bg-paper">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link href={`/university-admin/projects/${project.id}`}>
                      <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusIndicator status={project.status} />
                    </div>
                  </div>
                </div>

                <Link href={`/university-admin/projects/${project.id}`}>
                  <p className="text-sm text-secondary mb-4 line-clamp-2">
                    {stripHtmlTags(project.description)}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-pale-primary text-primary rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 5 && (
                      <span className="px-2 py-1 bg-pale text-secondary rounded text-xs">
                        +{project.skills.length - 5}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-custom">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{currencySymbol}{getBudgetValue(project).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-secondary" />
                        <span className="text-secondary">
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-start gap-2 mt-4 pt-4 border-t border-custom">
                  {!projectIsPublished && (
                    <Button
                      onClick={(e) => handleApproveProject(project, e)}
                      loading={isUpdating}
                      className="w-max bg-green-600 hover:bg-green-700 text-white text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </Button>
                  )}
                  {projectIsPublished && (
                    <Button
                      onClick={(e) => handleDisapproveProject(project, e)}
                      loading={isUpdating}
                      className="w-max bg-red-600 hover:bg-red-700 text-white text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <XCircle size={14} />
                      Disapprove
                    </Button>
                  )}
                  <Link href={`/university-admin/projects/${project.id}`}>
                    <Button className="w-max bg-pale text-primary text-sm py-2 flex items-center justify-center gap-2">
                      <Eye size={14} />
                      View
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {projectsTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-custom pt-4">
            <div className="text-sm text-secondary">
              Showing {((projectsPage - 1) * projectsLimit) + 1} - {Math.min(projectsPage * projectsLimit, projectsTotal)} of {projectsTotal} projects
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProjectsPage((prev) => Math.max(1, prev - 1))}
                disabled={projectsPage === 1}
                className={`px-3 py-1.5 rounded text-sm border border-custom flex items-center gap-1 ${
                  projectsPage === 1
                    ? 'text-muted-light cursor-not-allowed opacity-50'
                    : 'text-secondary hover:bg-pale'
                }`}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, projectsTotalPages) }, (_, i) => {
                  let pageNum: number;
                  if (projectsTotalPages <= 5) {
                    pageNum = i + 1;
                  } else if (projectsPage <= 3) {
                    pageNum = i + 1;
                  } else if (projectsPage >= projectsTotalPages - 2) {
                    pageNum = projectsTotalPages - 4 + i;
                  } else {
                    pageNum = projectsPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setProjectsPage(pageNum)}
                      className={`px-3 py-1.5 rounded text-sm border border-custom ${
                        projectsPage === pageNum
                          ? 'bg-primary text-white border-primary'
                          : 'text-secondary hover:bg-pale'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setProjectsPage((prev) => Math.min(projectsTotalPages, prev + 1))}
                disabled={projectsPage === projectsTotalPages}
                className={`px-3 py-1.5 rounded text-sm border border-custom flex items-center gap-1 ${
                  projectsPage === projectsTotalPages
                    ? 'text-muted-light cursor-not-allowed opacity-50'
                    : 'text-secondary hover:bg-pale'
                }`}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Button
          onClick={() => router.push("/university-admin/departments")}
          className={`${buttonBaseClasses} bg-pale text-primary`}
        >
          <ArrowLeft size={16} />
          Back to Faculties
        </Button>
        <div className="flex gap-2">
          {activeTab === "programmes" && (
            <Button
              onClick={() => setIsBulkUploadModalOpen(true)}
              className={`${buttonBaseClasses} bg-pale text-primary`}
              disabled={!department}
            >
              <Upload size={16} />
              Bulk Upload
            </Button>
          )}
          {primaryActionLabel && (
            <Button
              className={`${buttonBaseClasses} bg-primary`}
              onClick={handlePrimaryAction}
              disabled={!department}
            >
              <Plus size={16} />
              {primaryActionLabel}
            </Button>
          )}
        </div>
      </div>
      <div role="tablist" aria-label="Department detail tabs" className="flex gap-8 border-b border-custom mb-6">
        {[
          { id: "programmes", label: "Programmes", count: scopedCourses.length },
          { id: "supervisors", label: "Supervisors", count: supervisors.length },
          { id: "projects", label: "Projects", count: projectsTotal },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id as "programmes" | "supervisors" | "projects")}
              className={`pb-3 text-[0.9rem] font-medium border-b-2 transition-colors ${isActive ? "border-primary text-primary" : "border-transparent text-muted hover:text-primary"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "programmes" ? (
        scopedCourses.length === 0 ? (
          <div className="text-center py-12 bg-paper rounded-lg">
            <p className="text-[0.875rem] opacity-60">
              No programmes yet for {department.name}. Use the &quot;Add Programme&quot; button above to
              create your first programme.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scopedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                studentCount={studentCounts[course.id]}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onSelect={handleViewDetails}
              />
            ))}
          </div>
        )
      ) : activeTab === "supervisors" ? (
        renderSupervisors()
      ) : (
        renderProjects()
      )}

      <Modal
        title={editingCourse ? "Edit Programme" : "Create Programme"}
        open={isModalOpen}
        handleClose={handleClose}
        actions={[
          <Button key="cancel" onClick={handleClose} className="bg-pale text-primary">
            Cancel
          </Button>,
          <Button key="submit" onClick={handleSubmit} className="bg-primary" loading={isSubmitting}>
            {editingCourse ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-muted mb-1">Department</p>
            <p className="text-sm font-medium">{department.name}</p>
          </div>
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
            Programmes are assigned to students and used for project matching. Examples: Bachelor of
            Engineering (B.E.), Bachelor of Science (B.Sc.), etc.
          </p>
        </div>
      </Modal>

      <ManualEntryForm
        open={isSupervisorModalOpen}
        uploadType="supervisor"
        onClose={() => setIsSupervisorModalOpen(false)}
        onSubmit={handleSupervisorSubmit}
        departments={department ? [department] : []}
        lockDepartmentId={department?.id}
        hideDepartmentField={true}
        isSubmitting={isSupervisorCreating}
      />

      <Modal
        title={`Bulk Upload Programmes (${department.name})`}
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
          <Button key="upload" onClick={handleBulkUpload} className="bg-primary" disabled={selectedFiles.length === 0} loading={isBulkUploading}>
            <Upload size={16} className="mr-2" />
            Upload CSV
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <FileUpload onFileSelect={setSelectedFiles} accept=".csv" multiple={false} />
          {selectedFiles.length > 0 && (
            <div className="p-4 bg-pale rounded-lg">
              <p className="text-[0.875rem] font-medium mb-2">Selected File:</p>
              <p className="text-[0.8125rem] opacity-60">{selectedFiles[0].name}</p>
            </div>
          )}
          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.875rem] font-medium">CSV Template Format:</p>
              <Button onClick={downloadProgrammesTemplate} className="bg-primary text-[0.8125rem] py-1.5 px-3">
                Download Template
              </Button>
            </div>
            <p className="text-[0.8125rem] opacity-60">name</p>
            <p className="text-[0.75rem] opacity-50 mt-2">
              Programmes uploaded here will automatically be linked to the {department.name} department.
            </p>
          </div>
        </div>
      </Modal>

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
        loading={isDeleting}
      />

      <ConfirmationDialog
        open={showSupervisorDeleteConfirm}
        onClose={() => {
          setShowSupervisorDeleteConfirm(false);
          setSupervisorToDelete(null);
        }}
        onConfirm={handleConfirmDeleteSupervisor}
        title="Delete Supervisor"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete this supervisor? This action cannot be undone.</p>
            <p className="text-[0.8125rem] opacity-75">
              {supervisorToDelete?.name || supervisorToDelete?.email} will be removed from this department.
            </p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeletingSupervisor}
      />

      <ConfirmationDialog
        open={showSupervisorSuspendConfirm}
        onClose={() => {
          setShowSupervisorSuspendConfirm(false);
          setSupervisorToSuspend(null);
        }}
        onConfirm={handleConfirmSuspend}
        title="Suspend Supervisor"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to suspend this supervisor?</p>
            <p className="text-[0.8125rem] opacity-75">
              {supervisorToSuspend?.name || supervisorToSuspend?.email} will be suspended and unable to access the system.
            </p>
          </div>
        }
        type="warning"
        confirmText="Suspend"
        cancelText="Cancel"
        loading={isSuspendingSupervisor}
      />
    </div>
  );
}

