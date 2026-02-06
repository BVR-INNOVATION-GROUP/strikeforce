"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import Select from "@/src/components/core/Select";
import { OptionI } from "@/src/components/core/Select";
import DataTable from "@/src/components/base/DataTable";
import { Column } from "@/src/components/base/DataTable";
import BarChart from "@/src/components/base/BarChart";
import LineChart from "@/src/components/base/LineChart";
import { adminRepository, AdminStudent } from "@/src/repositories/adminRepository";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { useToast } from "@/src/hooks/useToast";
import { Users, GraduationCap, Trash2, Filter } from "lucide-react";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import Button from "@/src/components/core/Button";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Super Admin Students - Stat cards, charts, table with filters and sort
 */
export default function SuperAdminStudentsPage() {
  const { showError, showSuccess } = useToast();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [organizations, setOrganizations] = useState<{ id: number; name: string; type: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [universityFilter, setUniversityFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<AdminStudent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const filters: { universityId?: number; departmentId?: number; courseId?: number } = {};
      if (universityFilter) filters.universityId = parseInt(universityFilter, 10);
      if (departmentFilter) filters.departmentId = parseInt(departmentFilter, 10);
      if (courseFilter) filters.courseId = parseInt(courseFilter, 10);
      const data = await adminRepository.getStudents(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      showError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgs = async () => {
    try {
      const orgs = await organizationRepository.getAll();
      setOrganizations(orgs.map((o) => ({ id: o.id, name: o.name, type: o.type })));
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const depts = await adminRepository.getDepartments(
        universityFilter ? parseInt(universityFilter, 10) : undefined
      );
      setDepartments(Array.isArray(depts) ? depts : []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setDepartments([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const crs = await adminRepository.getCourses(
        departmentFilter ? parseInt(departmentFilter, 10) : undefined
      );
      setCourses(Array.isArray(crs) ? crs : []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [universityFilter, departmentFilter, courseFilter]);

  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    fetchDepartments();
    if (!universityFilter) setDepartmentFilter("");
  }, [universityFilter]);

  useEffect(() => {
    fetchCourses();
    if (!departmentFilter) setCourseFilter("");
  }, [departmentFilter]);

  const universities = organizations.filter((o) => o.type === "UNIVERSITY");

  const universityOptions: OptionI[] = useMemo(
    () => [
      { label: "All universities", value: "" },
      ...universities.map((u) => ({ label: u.name, value: String(u.id) })),
    ],
    [universities]
  );

  const departmentOptions: OptionI[] = useMemo(
    () => [
      { label: "All departments", value: "" },
      ...departments.map((d) => ({ label: d.name, value: String(d.id) })),
    ],
    [departments]
  );

  const courseOptions: OptionI[] = useMemo(
    () => [
      { label: "All courses", value: "" },
      ...courses.map((c) => ({ label: c.name, value: String(c.id) })),
    ],
    [courses]
  );

  const stats = useMemo(() => {
    const byUniversity = new Map<string, number>();
    students.forEach((s) => {
      const name = s.course?.department?.organization?.name ?? "Unknown";
      byUniversity.set(name, (byUniversity.get(name) ?? 0) + 1);
    });
    return {
      total: students.length,
      byUniversity: Array.from(byUniversity.entries()).map(([name, count]) => ({ name, Students: count })),
    };
  }, [students]);

  const studentsByMonthData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return [5, 4, 3, 2, 1, 0].map((monthOffset) => {
      const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const monthStart = d.toISOString();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
      const count = students.filter((s) => {
        const created = s.user?.createdAt ?? s.createdAt;
        if (!created) return false;
        const date = new Date(created);
        return date >= new Date(monthStart) && date <= new Date(monthEnd);
      }).length;
      return { name: months[d.getMonth()], Students: count };
    }).reverse();
  }, [students]);

  const tableData = useMemo(
    () =>
      students.map((s) => ({
        id: String(s.id),
        name: s.user?.name ?? `Student #${s.id}`,
        email: s.user?.email ?? "",
        university: s.course?.department?.organization?.name ?? "—",
        department: s.course?.department?.name ?? "—",
        course: s.course?.name ?? "—",
        studentId: s.studentId ?? "—",
      })),
    [students]
  );

  const columns: Column<typeof tableData[0]>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "university", header: "University", sortable: true },
    { key: "department", header: "Department", sortable: true },
    { key: "course", header: "Course", sortable: true },
    { key: "studentId", header: "Student ID", sortable: true },
  ];

  const handleDeleteRequest = (student: AdminStudent) => {
    setStudentToDelete(student);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await adminRepository.deleteStudent(studentToDelete.id);
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      showSuccess("Student deleted successfully");
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Failed to delete student:", error);
      showError("Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="w-full flex flex-col min-h-full">
        <div className="flex-shrink-0 mb-8">
          <Skeleton width={200} height={24} className="mb-2" />
          <Skeleton width={300} height={16} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Students</h1>
        <p className="text-[0.875rem] opacity-60">All students on the platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users size={20} />} title="Total Students" value={stats.total} />
        <StatCard icon={<GraduationCap size={20} />} title="Universities" value={universities.length} />
        <StatCard icon={<Users size={20} />} title="Filtered" value={students.length} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="Students by University"
          data={stats.byUniversity.slice(0, 10)}
          bars={[{ key: "Students", label: "Students" }]}
        />
        <LineChart
          title="Students Over Time"
          data={studentsByMonthData}
          lines={[{ key: "Students", label: "Students" }]}
        />
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px]">
            <Select
              title="University"
              options={universityOptions}
              value={universityFilter}
              onChange={(opt) => setUniversityFilter(typeof opt === "object" ? String(opt.value) : opt)}
              placeHolder="All universities"
              searchable
            />
          </div>
          <div className="min-w-[200px]">
            <Select
              title="Department"
              options={departmentOptions}
              value={departmentFilter}
              onChange={(opt) => setDepartmentFilter(typeof opt === "object" ? String(opt.value) : opt)}
              placeHolder="All departments"
              searchable
            />
          </div>
          <div className="min-w-[200px]">
            <Select
              title="Course"
              options={courseOptions}
              value={courseFilter}
              onChange={(opt) => setCourseFilter(typeof opt === "object" ? String(opt.value) : opt)}
              placeHolder="All courses"
              searchable
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">All Students</h2>
        <DataTable
          data={tableData}
          columns={columns}
          showCheckboxes={false}
          showActions={true}
          pageSize={10}
          emptyMessage="No students found"
          onDelete={(row) => {
            const student = students.find((s) => String(s.id) === row.id);
            if (student) handleDeleteRequest(student);
          }}
        />
      </Card>

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        message={
          <div>
            <p>
              Are you sure you want to delete{" "}
              <strong>{studentToDelete?.user?.name ?? "this student"}</strong>?
            </p>
            <p className="text-sm opacity-75 mt-2">
              This will permanently remove the student record and their user account.
            </p>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
}
