/**
 * Student Details Modal - Side panel for viewing student details
 */
"use client";

import React, { useState, useEffect } from "react";
import SideModal from "@/src/components/base/SideModal";
import Button from "@/src/components/core/Button";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { UserI } from "@/src/models/user";
import { DepartmentI, CourseI, ProjectI } from "@/src/models/project";
import { GroupI } from "@/src/models/group";
import { ApplicationI } from "@/src/models/application";
import { User, Mail, Calendar, Edit, Trash2, Building2, BookOpen, Users, Briefcase, MapPin, CalendarDays } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";
import { groupRepository } from "@/src/repositories/groupRepository";
import { applicationService } from "@/src/services/applicationService";
import { projectService } from "@/src/services/projectService";

export interface Props {
  open: boolean;
  onClose: () => void;
  student: UserI | null;
  department?: DepartmentI;
  programme?: CourseI;
  onEdit?: (student: UserI) => void;
  onDelete: (studentId: string) => void;
  onSuspend?: (studentId: string) => void;
}

/**
 * Side modal for student details
 */
const StudentDetailsModal = ({
  open,
  onClose,
  student,
  department,
  programme,
  onEdit,
  onDelete,
  onSuspend,
}: Props) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [groups, setGroups] = useState<GroupI[]>([]);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (open && student?.id) {
      loadStudentData();
    }
  }, [open, student?.id]);

  const loadStudentData = async () => {
    if (!student?.id) return;

    const studentId = typeof student.id === "number" ? student.id : parseInt(student.id.toString(), 10);

    // Load groups
    setLoadingGroups(true);
    try {
      // Get all groups and filter by memberIds
      const allGroups = await groupRepository.getAll();
      const studentGroups = allGroups.filter(
        (g) => g.leaderId === studentId || (g.memberIds && g.memberIds.includes(studentId))
      );
      setGroups(studentGroups);
    } catch (error) {
      console.error("Failed to load groups:", error);
    } finally {
      setLoadingGroups(false);
    }

    // Load applications and projects
    setLoadingProjects(true);
    try {
      // Get all applications from repository
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      const allApplications = await applicationRepository.getAll();
      
      // Filter by studentIds
      const studentApplications = allApplications.filter(
        (app) => app.studentIds && app.studentIds.includes(studentId)
      );
      setApplications(studentApplications);

      // Get projects from applications
      const projectIds = studentApplications.map((app) => app.projectId);
      if (projectIds.length > 0) {
        const allProjects = await projectService.getAllProjects();
        const studentProjects = allProjects.filter((p) =>
          projectIds.includes(typeof p.id === "number" ? p.id : parseInt(p.id.toString(), 10))
        );
        setProjects(studentProjects);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  if (!student) return null;

  const handleEdit = () => {
    if (onEdit && student) {
      onEdit(student);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    const studentId = typeof student.id === "number" ? student.id.toString() : student.id;
    onDelete(studentId);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleConfirmSuspend = () => {
    if (onSuspend) {
      const studentId = typeof student.id === "number" ? student.id.toString() : student.id;
      onSuspend(studentId);
      setShowSuspendConfirm(false);
      onClose();
    }
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Student Details"
    >
      <div className="flex flex-col gap-6">
        {/* Icon and Name */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-pale-primary rounded-lg">
            <User size={32} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[1.125rem] font-[600] mb-1">{student.name}</h3>
            <p className="text-[0.875rem] opacity-60">Student</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Email</p>
            </div>
            <p className="text-[0.875rem] opacity-60">
              {student.email}
            </p>
          </div>

          {department && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Department</p>
              </div>
              <p className="text-[0.875rem] opacity-60">
                {department.name}
              </p>
            </div>
          )}

          {programme && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Programme</p>
              </div>
              <p className="text-[0.875rem] opacity-60">
                {programme.name}
              </p>
            </div>
          )}

          {((student as any).branchId || (student as any).branch) && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Branch</p>
              </div>
              <p className="text-[0.875rem] opacity-60">
                {(student as any).branch?.name || (student as any).branch?.Name || "N/A"}
              </p>
            </div>
          )}

          {(student as any).birthYear && (student as any).birthYear > 0 && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Birth Year</p>
              </div>
              <p className="text-[0.875rem] opacity-60">
                {(student as any).birthYear}
              </p>
            </div>
          )}

          {(student as any).enrollmentYear && (student as any).enrollmentYear > 0 && (
            <div className="p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={16} className="opacity-60" />
                <p className="text-[0.875rem] font-medium">Enrollment Year</p>
              </div>
              <p className="text-[0.875rem] opacity-60">
                {(student as any).enrollmentYear}
              </p>
            </div>
          )}

          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="opacity-60" />
              <p className="text-[0.875rem] font-medium">Created Date</p>
            </div>
            <p className="text-[0.875rem] opacity-60">
              {formatDateShort(student.createdAt)}
            </p>
          </div>

        </div>

        {/* Groups Section */}
        <div className="pt-4 border-t border-custom">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary" />
            <h4 className="text-[0.875rem] font-semibold">Groups</h4>
          </div>
          {loadingGroups ? (
            <p className="text-[0.8125rem] opacity-60">Loading groups...</p>
          ) : groups.length === 0 ? (
            <p className="text-[0.8125rem] opacity-60">This student is not part of any groups.</p>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <div key={group.id} className="p-3 bg-pale rounded-lg">
                  <p className="text-[0.875rem] font-medium mb-1">{group.name}</p>
                  <p className="text-[0.75rem] opacity-60">
                    {group.leaderId === (typeof student.id === "number" ? student.id : parseInt(student.id.toString(), 10))
                      ? "Leader"
                      : "Member"}
                    {" • "}
                    {group.memberIds?.length || 0} member{group.memberIds?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="pt-4 border-t border-custom">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={18} className="text-primary" />
            <h4 className="text-[0.875rem] font-semibold">Projects</h4>
          </div>
          {loadingProjects ? (
            <p className="text-[0.8125rem] opacity-60">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-[0.8125rem] opacity-60">This student has not worked on any projects.</p>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => {
                const application = applications.find((app) => app.projectId === (typeof project.id === "number" ? project.id : parseInt(project.id.toString(), 10)));
                return (
                  <div key={project.id} className="p-3 bg-pale rounded-lg">
                    <p className="text-[0.875rem] font-medium mb-1">{project.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {application && (
                        <span className="text-[0.75rem] px-2 py-0.5 bg-paper text-primary rounded capitalize">
                          {application.status}
                        </span>
                      )}
                      <span className="text-[0.75rem] opacity-60">
                        {project.deadline && new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-custom">
          {onEdit && (
            <Button
              onClick={handleEdit}
              className="bg-pale text-primary flex-1"
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
          )}
          {onSuspend && (
            <Button
              onClick={() => setShowSuspendConfirm(true)}
              className="bg-pale text-primary flex-1"
            >
              Suspend
            </Button>
          )}
          <Button
            onClick={handleDeleteClick}
            className="bg-primary flex-1"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
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

      {/* Suspend Confirmation */}
      {onSuspend && (
        <ConfirmationDialog
          open={showSuspendConfirm}
          onClose={() => setShowSuspendConfirm(false)}
          onConfirm={handleConfirmSuspend}
          title="Suspend Student"
          message={
            <div className="space-y-2">
              <p>Are you sure you want to suspend this student?</p>
              <p className="text-[0.8125rem] opacity-75">
                {student.name || student.email} will be suspended and unable to access the system.
              </p>
            </div>
          }
          type="warning"
          confirmText="Suspend"
          cancelText="Cancel"
        />
      )}
    </SideModal>
  );
};

export default StudentDetailsModal;

