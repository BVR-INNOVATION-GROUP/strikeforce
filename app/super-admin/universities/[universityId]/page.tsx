"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { organizationService } from "@/src/services/organizationService";
import { projectRepository } from "@/src/repositories/projectRepository";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { adminRepository } from "@/src/repositories/adminRepository";
import { OrganizationI } from "@/src/models/organization";
import { ProjectI } from "@/src/models/project";
import { GraduationCap, ArrowLeft, Briefcase, Users, FolderTree, BookOpen, UserCheck, Handshake } from "lucide-react";
import { useToast } from "@/src/hooks/useToast";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Super Admin University Detail - Drill-down with departments, students, partners, projects, supervisors
 */
export default function SuperAdminUniversityDetailPage() {
  const router = useRouter();
  const params = useParams<{ universityId?: string | string[] }>();
  const { showError } = useToast();

  const universityId = useMemo(() => {
    const value = params?.universityId;
    if (Array.isArray(value)) return value[0] || "";
    return value || "";
  }, [params?.universityId]);

  const [university, setUniversity] = useState<OrganizationI | null>(null);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [students, setStudents] = useState<{ id: number; user?: { name: string; email: string }; course?: { name: string } }[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [supervisors, setSupervisors] = useState<{ id: number; userId: number; user?: { name: string; email: string }; department?: { name: string } }[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!universityId || universityId.trim() === "") {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await organizationService.getOrganization(universityId);
        setUniversity(data);
      } catch (error) {
        console.error("Failed to load university:", error);
        showError("Failed to load university");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [universityId]);

  useEffect(() => {
    if (!universityId) return;
    const loadProjects = async () => {
      try {
        const result = await projectRepository.getAll({
          universityId: universityId,
          limit: 50,
        });
        setProjects(result.projects);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    loadProjects();
  }, [universityId]);

  useEffect(() => {
    if (!universityId) return;
    const loadStudents = async () => {
      try {
        const data = await adminRepository.getStudents({ universityId: parseInt(universityId, 10) });
        setStudents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load students:", error);
      }
    };
    loadStudents();
  }, [universityId]);

  useEffect(() => {
    if (!universityId) return;
    const loadDepartments = async () => {
      try {
        const depts = await adminRepository.getDepartments(parseInt(universityId, 10));
        setDepartments(Array.isArray(depts) ? depts : []);
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    };
    loadDepartments();
  }, [universityId]);

  useEffect(() => {
    if (!universityId) return;
    const loadSupervisors = async () => {
      try {
        const sups = await adminRepository.getSupervisors(parseInt(universityId, 10));
        setSupervisors(Array.isArray(sups) ? sups : []);
      } catch (error) {
        console.error("Failed to load supervisors:", error);
      }
    };
    loadSupervisors();
  }, [universityId]);

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const orgs = await organizationRepository.getAll();
        setOrganizations(orgs || []);
      } catch (error) {
        console.error("Failed to load organizations:", error);
      }
    };
    loadOrgs();
  }, []);

  const partners = useMemo(() => {
    const partnerUserIds = new Set(projects.map((p) => p.partnerId).filter(Boolean));
    return organizations
      .filter(
        (o) =>
          o.type === "PARTNER" && o.userId != null && partnerUserIds.has(Number(o.userId))
      )
      .map((o) => ({ id: o.id, name: o.name }));
  }, [projects, organizations]);

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        <Skeleton width={120} height={40} className="mb-6" />
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <Skeleton width={56} height={56} rounded="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton width={200} height={24} />
              <Skeleton width={150} height={16} />
            </div>
          </div>
        </Card>
        <Skeleton width={150} height={24} className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" rounded="lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        <Card className="text-center py-12">
          <p className="text-secondary mb-4">University not found</p>
          <Button onClick={() => router.push("/super-admin/universities")}>
            Back to Universities
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/super-admin/universities")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
      </div>

      {/* University info */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <GraduationCap size={32} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-semibold">{university.name}</h1>
              <StatusIndicator status={university.kycStatus} />
            </div>
            <p className="text-sm opacity-60">{university.email}</p>
          </div>
        </div>
      </Card>

      {/* Departments & Courses */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FolderTree size={20} />
          Departments ({departments.length})
        </h2>
        {departments.length === 0 ? (
          <Card className="py-8 text-center opacity-60">No departments found</Card>
        ) : (
          <div className="space-y-2">
            {departments.slice(0, 10).map((d) => (
              <Card key={d.id} className="p-3">
                <p className="font-medium">{d.name}</p>
              </Card>
            ))}
            {departments.length > 10 && (
              <p className="text-sm opacity-60 text-center py-2">
                Showing 10 of {departments.length} departments
              </p>
            )}
          </div>
        )}
      </div>

      {/* Partners */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Handshake size={20} />
          Partners ({partners.length})
        </h2>
        {partners.length === 0 ? (
          <Card className="py-8 text-center opacity-60">No partners with projects in this university</Card>
        ) : (
          <div className="space-y-2">
            {partners.map((p) => (
              <Link key={p.id} href={`/super-admin/partners/${p.id}`}>
                <Card className="p-3 hover:bg-pale cursor-pointer transition-colors">
                  <p className="font-medium">{p.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Supervisors */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserCheck size={20} />
          Supervisors ({supervisors.length})
        </h2>
        {supervisors.length === 0 ? (
          <Card className="py-8 text-center opacity-60">No supervisors found</Card>
        ) : (
          <div className="space-y-2">
            {supervisors.slice(0, 10).map((s) => (
              <Card key={s.id} className="p-3">
                <p className="font-medium">{s.user?.name ?? `Supervisor #${s.id}`}</p>
                <p className="text-sm opacity-60">{s.user?.email ?? ""} · {s.department?.name ?? "—"}</p>
              </Card>
            ))}
            {supervisors.length > 10 && (
              <p className="text-sm opacity-60 text-center py-2">
                Showing 10 of {supervisors.length} supervisors
              </p>
            )}
          </div>
        )}
      </div>

      {/* Students */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} />
          Students ({students.length})
        </h2>
        {students.length === 0 ? (
          <Card className="py-8 text-center opacity-60">No students found</Card>
        ) : (
          <div className="space-y-2">
            {students.slice(0, 10).map((s) => (
              <Card key={s.id} className="p-3">
                <p className="font-medium">{s.user?.name ?? `Student #${s.id}`}</p>
                <p className="text-sm opacity-60">{s.user?.email} · {s.course?.name ?? "—"}</p>
              </Card>
            ))}
            {students.length > 10 && (
              <p className="text-sm opacity-60 text-center py-2">
                Showing 10 of {students.length} students
              </p>
            )}
          </div>
        )}
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase size={20} />
          Projects ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <Card className="py-8 text-center opacity-60">No projects found</Card>
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 10).map((p) => (
              <Card key={p.id} className="p-3">
                <p className="font-medium">{p.title}</p>
                <p className="text-sm opacity-60">{p.status}</p>
              </Card>
            ))}
            {projects.length > 10 && (
              <p className="text-sm opacity-60 text-center py-2">
                Showing 10 of {projects.length} projects
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
