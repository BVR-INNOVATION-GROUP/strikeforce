import { api } from "@/src/api/client";
import { UserI } from "@/src/models/user";

export interface StudentRecord extends UserI {
  studentId?: string;
  departmentName?: string;
  courseName?: string;
  gender?: string;
  district?: string;
  universityBranch?: string;
  birthYear?: number;
  enrollmentYear?: number;
  branchId?: number;
  branch?: { id: number; name: string };
  courseId?: number;
  departmentId?: number;
}

// Backend Student model structure (GORM returns capitalized field names)
interface BackendStudent {
  ID?: number; // GORM uses capitalized ID
  id?: number; // Fallback for camelCase
  userId: number;
  studentId?: string;
  courseId: number;
  branchId?: number;
  gender?: string;
  district?: string;
  universityBranch?: string;
  birthYear?: number;
  enrollmentYear?: number;
  user?: {
    ID?: number; // GORM uses capitalized ID
    id?: number; // Fallback for camelCase
    name: string;
    email: string;
    profile?: {
      avatar?: string;
      bio?: string;
      location?: string;
    };
    CreatedAt?: string; // GORM uses capitalized
    createdAt?: string; // Fallback
    UpdatedAt?: string; // GORM uses capitalized
    updatedAt?: string; // Fallback
  };
  course?: {
    ID?: number; // GORM uses capitalized ID
    id?: number; // Fallback
    name: string;
    departmentId?: number;
    department?: {
      ID?: number; // GORM uses capitalized ID
      id?: number; // Fallback
      name: string;
    };
  };
  branch?: {
    ID?: number; // GORM uses capitalized ID
    id?: number; // Fallback
    name: string;
  };
  CreatedAt?: string; // GORM uses capitalized
  createdAt?: string; // Fallback
  UpdatedAt?: string; // GORM uses capitalized
  updatedAt?: string; // Fallback
}

/**
 * Transform backend Student model to frontend StudentRecord
 * Handles GORM's capitalized field names (ID, CreatedAt, etc.)
 */
function transformStudent(student: BackendStudent): StudentRecord {
  const user = student.user || {};
  // Handle both string and null/undefined studentId - check multiple possible field names
  const studentId = student.studentId || 
                    (student as any).student_id || 
                    (student as any).StudentID ||
                    undefined;
  
  // Handle GORM's capitalized ID fields
  const studentRecordId = student.ID || student.id;
  const userId = user.ID || user.id || student.userId;
  
  // Handle GORM's capitalized date fields
  const createdAt = user.CreatedAt || user.createdAt || student.CreatedAt || student.createdAt;
  const updatedAt = user.UpdatedAt || user.updatedAt || student.UpdatedAt || student.updatedAt;
  
  // Handle course and department IDs (GORM uses capitalized)
  const courseId = student.courseId;
  const departmentId = student.course?.departmentId;
  const courseName = student.course?.name;
  const departmentName = student.course?.department?.name;
  
  // Handle branch (GORM uses capitalized ID)
  const branchId = student.branchId;
  const branch = student.branch ? {
    id: student.branch.ID || student.branch.id || 0,
    name: student.branch.name
  } : undefined;
  
  // Debug logging to verify studentId is present
  if (studentId) {
    console.log("[transformStudent] Found studentId:", studentId, "for student:", userId);
  } else {
    console.warn("[transformStudent] No studentId found for student:", userId, "Raw student:", student);
  }
  
  return {
    id: userId,
    userId: student.userId,
    name: user.name || "",
    email: user.email || "",
    profile: user.profile,
    createdAt: createdAt,
    updatedAt: updatedAt,
    studentId: studentId, // Explicitly set studentId
    courseId: courseId,
    departmentId: departmentId,
    courseName: courseName,
    departmentName: departmentName,
    branchId: branchId,
    branch: branch,
    gender: student.gender,
    district: student.district,
    universityBranch: student.universityBranch,
    birthYear: student.birthYear,
    enrollmentYear: student.enrollmentYear,
  };
}

export const studentRepository = {
  /**
   * Get students for a specific university (organization)
   */
  getByUniversity: async (universityId: number): Promise<StudentRecord[]> => {
    const rawResponse = await api.get<BackendStudent[]>(`/api/v1/students?universityId=${universityId}`);
    console.log("[studentRepository.getByUniversity] Raw response:", rawResponse);
    const transformed = rawResponse.map(transformStudent);
    console.log("[studentRepository.getByUniversity] Transformed students:", transformed.map(s => ({ id: s.id, name: s.name, studentId: s.studentId })));
    return transformed;
  },

  /**
   * Get students for a specific course
   */
  getByCourse: async (courseId: number): Promise<StudentRecord[]> => {
    const rawResponse = await api.get<BackendStudent[]>(`/api/v1/students?courseId=${courseId}`);
    console.log("[studentRepository.getByCourse] Raw response:", rawResponse);
    const transformed = rawResponse.map(transformStudent);
    console.log("[studentRepository.getByCourse] Transformed students:", transformed.map(s => ({ id: s.id, name: s.name, studentId: s.studentId })));
    return transformed;
  },
};





