import { api } from "@/src/api/client";
import { CollegeI } from "@/src/models/college";

function normalizeCollege(college: any): CollegeI {
  return {
    id:
      college?.ID !== undefined
        ? college.ID
        : college?.id !== undefined
          ? college.id
          : college?.Id,
    name: college?.name || "",
    organizationId:
      college?.organizationId || college?.organization_id || college?.OrganizationID || 0,
    createdAt: college?.CreatedAt || college?.createdAt || "",
    updatedAt: college?.UpdatedAt || college?.updatedAt || "",
  };
}

export const collegeRepository = {
  getAll: async (): Promise<CollegeI[]> => {
    const colleges = await api.get<any[]>("/api/v1/colleges");
    return Array.isArray(colleges) ? colleges.map(normalizeCollege) : [];
  },

  getById: async (id: string | number): Promise<CollegeI> => {
    const college = await api.get<any>(`/api/v1/colleges/${id}`);
    return normalizeCollege(college);
  },

  create: async (payload: { name: string }): Promise<CollegeI> => {
    const college = await api.post<any>("/api/v1/colleges", payload);
    return normalizeCollege(college);
  },

  update: async (id: string | number, payload: { name: string }): Promise<CollegeI> => {
    const college = await api.put<any>(`/api/v1/colleges/${id}`, payload);
    return normalizeCollege(college);
  },

  delete: async (id: string | number): Promise<void> => {
    return api.delete(`/api/v1/colleges/${id}`);
  },
};




