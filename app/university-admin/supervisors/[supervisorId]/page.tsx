"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { UserI } from "@/src/models/user";
import { ProjectI } from "@/src/models/project";
import { ArrowLeft, Building2, Calendar } from "lucide-react";
import { api } from "@/src/api/client";
import { projectService } from "@/src/services/projectService";
import { getInitials } from "@/src/utils/avatarUtils";

export default function SupervisorDetailPage() {
  const router = useRouter();
  const params = useParams<{ supervisorId?: string | string[] }>();
  const { showSuccess, showError } = useToast();
  
  const supervisorId = Array.isArray(params?.supervisorId) 
    ? params.supervisorId[0] 
    : params?.supervisorId || "";

  const [supervisor, setSupervisor] = useState<{ 
    user: UserI; 
    departmentId: number;
    department?: { name: string; organization?: { name: string } };
  } | null>(null);
  const [projects, setProjects] = useState<ProjectI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supervisorId || supervisorId.trim() === "") {
      return;
    }
    loadData();
  }, [supervisorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load supervisor details
      const response = await api.get<{ 
        ID?: number; 
        id?: number; 
        user: UserI & { ID?: number }; 
        departmentId: number;
        department?: { 
          ID?: number;
          id?: number;
          name: string;
          organization?: { 
            ID?: number;
            id?: number;
            name: string;
          };
        };
      }>(
        `/api/v1/supervisors/${supervisorId}`
      );
      
      // Normalize the response
      const normalizedResponse = {
        user: {
          ...response.user,
          id: response.user.ID || response.user.id,
        },
        departmentId: response.departmentId,
        department: response.department ? {
          name: response.department.name,
          organization: response.department.organization ? {
            name: response.department.organization.name,
          } : undefined,
        } : undefined,
      };
      setSupervisor(normalizedResponse);

      // Load projects for this supervisor
      // The supervisorId in the URL is the supervisor record ID, but we need the user ID for projects
      const userId = normalizedResponse.user?.id;
      if (!userId) {
        showError("Supervisor user ID not found");
        return;
      }
      
      const numericUserId = typeof userId === "number" 
        ? userId 
        : parseInt(userId.toString(), 10);
      
      const { projects: projectList } = await projectService.getAllProjects({
        supervisorId: numericUserId.toString(),
      });
      setProjects(projectList);
    } catch (error) {
      console.error("Failed to load supervisor data:", error);
      showError("Failed to load supervisor information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        Loading...
      </div>
    );
  }

  if (!supervisor) {
    return (
      <div className="w-full flex flex-col min-h-full items-center justify-center p-8 text-center">
        <p className="text-secondary">Supervisor not found.</p>
        <Button className="mt-4 bg-primary" onClick={() => router.push("/university-admin/departments")}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Back button on its own row */}
      <div className="mb-6">
        <Button
          onClick={() => router.back()}
          className="bg-pale text-primary"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>

      {/* Supervisor details card */}
      <div className="mb-6 bg-paper rounded-lg p-6 shadow-custom">
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar with initials */}
          <div className="w-20 h-20 rounded-full bg-pale flex items-center justify-center flex-shrink-0">
            {supervisor.user.profile?.avatar ? (
              <img
                src={supervisor.user.profile.avatar}
                alt={supervisor.user.name || supervisor.user.email}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-semibold text-2xl">
                {getInitials(supervisor.user.name || supervisor.user.email)}
              </span>
            )}
          </div>
          
          {/* Name and role */}
          <div className="flex-1">
            <h1 className="text-[1.125rem] font-[600] mb-1">
              {supervisor.user.name || supervisor.user.email}
            </h1>
            <p className="text-[0.875rem] opacity-60 mb-2">{supervisor.user.email}</p>
            <span className="inline-block px-3 py-1 text-[0.75rem] font-medium bg-pale text-primary rounded-full capitalize">
              {supervisor.user.role || "supervisor"}
            </span>
          </div>
        </div>

        {/* Additional details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-custom">
          {supervisor.department && (
            <div className="flex items-start gap-3">
              <Building2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[0.75rem] text-muted uppercase tracking-wide mb-1">Department</p>
                <p className="text-[0.875rem] font-medium">{supervisor.department.name}</p>
                {supervisor.department.organization && (
                  <p className="text-[0.75rem] opacity-60 mt-1">
                    {supervisor.department.organization.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {supervisor.user.createdAt && (
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[0.75rem] text-muted uppercase tracking-wide mb-1">Created</p>
                <p className="text-[0.875rem] font-medium">
                  {new Date(supervisor.user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects section */}
      <div className="mb-6">
        <h2 className="text-[0.95rem] font-semibold mb-4">Supervised Projects</h2>
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-paper rounded-lg">
            <p className="text-[0.875rem] opacity-60">
              This supervisor is not currently assigned to any projects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-paper rounded-lg p-5 shadow-custom cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/partner/projects/${project.id}`)}
              >
                <h3 className="text-[0.95rem] font-semibold mb-2">{project.title}</h3>
                <p className="text-[0.85rem] opacity-70 line-clamp-2 mb-3">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[0.75rem] px-2 py-1 bg-pale text-primary rounded capitalize">
                    {project.status}
                  </span>
                  {project.deadline && (
                    <span className="text-[0.75rem] opacity-60">
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

