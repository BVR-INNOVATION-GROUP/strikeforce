import { api } from "@/src/api/client";
import { UserI } from "@/src/models/user";

export interface StudentRecord extends UserI {
  departmentName?: string;
  courseName?: string;
  gender?: string;
  district?: string;
  universityBranch?: string;
  birthYear?: number;
  enrollmentYear?: number;
}

export const studentRepository = {
  /**
   * Get students for a specific university (organization)
   */
  getByUniversity: async (universityId: number): Promise<StudentRecord[]> => {
    return api.get<StudentRecord[]>(`/api/v1/students?universityId=${universityId}`);
  },

  /**
   * Get students for a specific course
   */
  getByCourse: async (courseId: number): Promise<StudentRecord[]> => {
    return api.get<StudentRecord[]>(`/api/v1/students?courseId=${courseId}`);
  },
};





