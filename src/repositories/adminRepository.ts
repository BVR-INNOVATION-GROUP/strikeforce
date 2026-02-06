/**
 * Repository for super-admin API operations
 */
import { api } from "@/src/api/client";

export interface DNASurveyItem {
  studentId: number;
  userId: number;
  studentName: string;
  studentEmail: string;
  universityName: string;
  courseName: string;
  hasCompleted: boolean;
  dnaArchetype?: string;
  completedAt?: string;
}

export interface AdminStudent {
  id: number;
  userId: number;
  studentId?: string;
  courseId: number;
  createdAt?: string;
  user?: { id: number; name: string; email: string; createdAt?: string };
  course?: {
    id: number;
    name: string;
    departmentId?: number;
    department?: { id: number; name: string; organization?: { name: string } };
  };
}

export interface AdminStudentsFilters {
  universityId?: number;
  departmentId?: number;
  courseId?: number;
}

export const adminRepository = {
  getStudents: async (filters?: AdminStudentsFilters | number): Promise<AdminStudent[]> => {
    const params = new URLSearchParams();
    if (filters) {
      if (typeof filters === "number") {
        params.set("universityId", String(filters));
      } else {
        if (filters.universityId) params.set("universityId", String(filters.universityId));
        if (filters.departmentId) params.set("departmentId", String(filters.departmentId));
        if (filters.courseId) params.set("courseId", String(filters.courseId));
      }
    }
    const qs = params.toString();
    const url = qs ? `/api/v1/admin/students?${qs}` : "/api/v1/admin/students";
    return api.get<AdminStudent[]>(url);
  },

  deleteStudent: async (studentId: number): Promise<void> => {
    return api.delete(`/api/v1/admin/students/${studentId}`);
  },

  getDepartments: async (universityId?: number): Promise<{ id: number; name: string; organizationId: number }[]> => {
    const url = universityId
      ? `/api/v1/admin/departments?universityId=${universityId}`
      : "/api/v1/admin/departments";
    return api.get<{ id: number; name: string; organizationId: number }[]>(url);
  },

  getCourses: async (departmentId?: number): Promise<{ id: number; name: string; departmentId: number }[]> => {
    const url = departmentId
      ? `/api/v1/admin/courses?departmentId=${departmentId}`
      : "/api/v1/admin/courses";
    return api.get<{ id: number; name: string; departmentId: number }[]>(url);
  },

  getSupervisors: async (universityId: number): Promise<{ id: number; userId: number; user?: { name: string; email: string }; department?: { name: string } }[]> => {
    return api.get(`/api/v1/admin/supervisors?universityId=${universityId}`);
  },

  getStudentSurveys: async (filters?: {
    universityId?: number;
    courseId?: number;
    completed?: boolean;
    archetype?: string;
  }): Promise<DNASurveyItem[]> => {
    const params = new URLSearchParams();
    if (filters?.universityId) params.set("universityId", String(filters.universityId));
    if (filters?.courseId) params.set("courseId", String(filters.courseId));
    if (filters?.completed !== undefined) params.set("completed", String(filters.completed));
    if (filters?.archetype) params.set("archetype", filters.archetype);
    const qs = params.toString();
    const url = qs ? `/api/v1/admin/student-surveys?${qs}` : "/api/v1/admin/student-surveys";
    return api.get<DNASurveyItem[]>(url);
  },

  getActiveUsers: async (minutes?: number): Promise<{ id: number; email: string; name: string; role: string; lastLoginAt?: string }[]> => {
    const url = minutes ? `/api/v1/admin/active-users?minutes=${minutes}` : "/api/v1/admin/active-users";
    return api.get(url);
  },

  registerUser: async (data: { email: string; name: string; role: string; password: string }): Promise<void> => {
    return api.post("/api/v1/admin/users", data);
  },

  blockUser: async (userId: number): Promise<void> => {
    return api.post(`/api/v1/admin/users/${userId}/block`, {});
  },

  unblockUser: async (userId: number): Promise<void> => {
    return api.post(`/api/v1/admin/users/${userId}/unblock`, {});
  },

  deleteUser: async (userId: number): Promise<void> => {
    return api.delete(`/api/v1/admin/users/${userId}`);
  },

  updateUserRole: async (userId: number, role: string): Promise<void> => {
    return api.put(`/api/v1/admin/users/${userId}/role`, { role });
  },

  createSampleAccount: async (role: string): Promise<{ email: string; password: string }> => {
    return api.post(`/api/v1/admin/sample-accounts`, { role });
  },

  deleteSampleAccounts: async (pattern?: string): Promise<{ msg?: string; deleted?: number }> => {
    const url = pattern ? `/api/v1/admin/sample-accounts?pattern=${encodeURIComponent(pattern)}` : "/api/v1/admin/sample-accounts";
    const res = await api.delete<{ msg?: string; deleted?: number }>(url);
    return res ?? {};
  },

  getLoginLogos: async (): Promise<{ id: number; name: string; logoUrl: string; altText?: string; sortOrder: number }[]> => {
    return api.get("/api/v1/admin/login-logos");
  },

  createLoginLogo: async (data: { name: string; logoUrl: string; altText?: string; sortOrder?: number }): Promise<{ id: number; name: string; logoUrl: string; altText?: string; sortOrder: number }> => {
    return api.post("/api/v1/admin/login-logos", data);
  },

  updateLoginLogo: async (id: number, data: { name?: string; logoUrl?: string; altText?: string; sortOrder?: number }): Promise<{ id: number; name: string; logoUrl: string; altText?: string; sortOrder: number }> => {
    return api.put(`/api/v1/admin/login-logos/${id}`, data);
  },

  deleteLoginLogo: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/admin/login-logos/${id}`);
  },

  getStorageUsage: async (): Promise<{
    configured: boolean;
    storage: number;
    bandwidth: number;
    resources: number;
  }> => {
    const res = await api.get<{ configured: boolean; storage: number; bandwidth: number; resources: number }>(
      "/api/v1/admin/storage-usage"
    );
    return res;
  },

  impersonateUser: async (userId: number): Promise<{ token: string; user: { id: number; name: string; email: string; role: string } }> => {
    const res = await api.post<{ token: string; user: { id: number; name: string; email: string; role: string } }>(
      `/api/v1/admin/impersonate/${userId}`,
      {}
    );
    return res;
  },
};
