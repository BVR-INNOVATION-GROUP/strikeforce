import { BASE_URL } from "@/src/api/client";
import { DepartmentI, CourseI } from "@/src/models/project";

// Use BASE_URL directly from client.ts, removing trailing slashes
export const base_url = BASE_URL.replace(/\/+$/, "");

export interface ResponseI<T> {
  data: T;
  msg: string;
  status?: number;
}

export class ApiError extends Error {
  status: number;
  payload?: ResponseI<unknown>;

  constructor(status: number, message: string, payload?: ResponseI<unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export interface SourceDepartment {
  ID?: number;
  id?: number;
  CreatedAt?: string;
  createdAt?: string;
  UpdatedAt?: string;
  updatedAt?: string;
  DeletedAt?: string | null;
  name: string;
  organization_id?: number;
  organizationId?: number;
  organization?: Record<string, any>;
  college_id?: number | null;
  collegeId?: number | null;
  CollegeID?: number | null;
  college?: { name?: string };
  College?: { Name?: string; name?: string };
}

export interface SourceCourse {
  ID?: number;
  id?: number;
  name: string;
  department_id?: number;
  departmentId?: number;
  DepartmentID?: number;
  CreatedAt?: string;
  createdAt?: string;
  Department?: Record<string, any>;
}

/**
 * Transforms a single department object from the API format to DepartmentI
 */
export function transformDepartment(source: SourceDepartment): DepartmentI {
  const normalizedId = source.ID ?? source.id ?? 0;
  const normalizedOrgId = source.organization_id ?? source.organizationId ?? 0;
  const normalizedCreatedAt = source.CreatedAt ?? source.createdAt ?? "";
  const normalizedUpdatedAt = source.UpdatedAt ?? source.updatedAt ?? "";
  const normalizedCollegeId =
    source.college_id ?? source.collegeId ?? source.CollegeID ?? null;
  const collegeName = source.college?.name || source.College?.Name || source.College?.name;
  return {
    id: normalizedId,
    universityId: normalizedOrgId,
    name: source.name,
    createdAt: normalizedCreatedAt,
    updatedAt: normalizedUpdatedAt,
    collegeId: normalizedCollegeId ?? undefined,
    collegeName,
  };
}

/**
 * Transforms a list of department objects from the API format to DepartmentI[]
 */
export function transformDepartments(
  sources: SourceDepartment[]
): DepartmentI[] {
  return sources.map(transformDepartment);
}

/**
 * Transforms a single course object from the API format to CourseI
 */
export function transformCourse(source: SourceCourse): CourseI {
  const normalizedId = source.ID ?? source.id ?? 0;
  const normalizedDeptId =
    source.DepartmentID ?? source.departmentId ?? source.department_id ?? 0;
  const normalizedCreatedAt = source.CreatedAt ?? source.createdAt ?? "";
  return {
    id: normalizedId,
    departmentId: normalizedDeptId,
    name: source.name,
    createdAt: normalizedCreatedAt,
  };
}

/**
 * Transforms a list of course objects from the API format to CourseI[]
 */
export function transformCourses(sources: SourceCourse[]): CourseI[] {
  return sources.map(transformCourse);
}

const getToken = (fallback?: string) => {
  if (fallback) return fallback;
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const buildErrorMessage = (
  status: number,
  data?: ResponseI<any>,
  fallback?: string
) => {
  const trimmedFallback = fallback?.trim();
  const message =
    data?.msg ||
    trimmedFallback ||
    "Request failed. Check server logs for details.";
  return `[${status}] ${message}`;
};

const parseResponse = <T>(text?: string, defaultValue?: T): ResponseI<T> => {
  if (!text || text.trim().length === 0) {
    return { data: defaultValue ?? ({} as T), msg: "" };
  }
  try {
    return JSON.parse(text) as ResponseI<T>;
  } catch {
    return { data: defaultValue ?? ({} as T), msg: text };
  }
};

export const GET = async <T>(path: string): Promise<ResponseI<T>> => {
  const token = getToken();
  try {
    const res = await fetch(`${base_url}/${path}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const text = await res.text();
    const data = parseResponse<T>(text);
    data.status = res.status;
    if (!res.ok) {
      throw new ApiError(
        res.status,
        buildErrorMessage(res.status, data, text),
        data
      );
    }
    return data as ResponseI<T>;
  } catch (error) {
    throw error;
  }
};

export const POST = async <T>(
  path: string,
  body: T,
  t?: string
): Promise<ResponseI<T>> => {
  // const token = localStorage.getItem("token");
  const token = getToken(t);
  try {
    const res = await fetch(`${base_url}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    const data = parseResponse<T>(text);
    data.status = res.status;
    if (!res.ok) {
      throw new ApiError(
        res.status,
        buildErrorMessage(res.status, data, text),
        data
      );
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const PUT = async <T>(
  path: string,
  body: Partial<T>,
  t?: string
): Promise<ResponseI<T>> => {
  const token = getToken(t);
  try {
    const res = await fetch(`${base_url}/${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    const data = parseResponse<T>(text);
    data.status = res.status;
    if (!res.ok) {
      throw new ApiError(
        res.status,
        buildErrorMessage(res.status, data, text),
        data
      );
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const DELETE_REQ = async (
  path: string,
  t?: string
): Promise<ResponseI<null>> => {
  const token = getToken(t);
  try {
    const res = await fetch(`${base_url}/${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const text = await res.text();
    const data = parseResponse<null>(text, null);
    data.status = res.status;
    if (!res.ok) {
      throw new ApiError(
        res.status,
        buildErrorMessage(res.status, data, text),
        data
      );
    }
    return data;
  } catch (error) {
    throw error;
  }
};
