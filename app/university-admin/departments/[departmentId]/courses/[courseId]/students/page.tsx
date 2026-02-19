"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/src/components/core/Button";
import TextArea from "@/src/components/core/TextArea";
import FileUpload from "@/src/components/base/FileUpload";
import JsonEditor from "@/src/components/core/JsonEditor";
import { useToast } from "@/src/hooks/useToast";
import { CourseI, DepartmentI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import { ArrowLeft, Plus, Eye, EyeOff } from "lucide-react";
import Modal from "@/src/components/base/Modal";
import Input from "@/src/components/core/Input";
import Select from "@/src/components/core/Select";
import StudentDetailsModal from "@/src/components/screen/university-admin/students/StudentDetailsModal";
import { GET, POST, PUT, SourceDepartment, SourceCourse, transformDepartment, transformCourses } from "@/base";
import { getInitials } from "@/src/utils/avatarUtils";
import { userRepository } from "@/src/repositories/userRepository";
import { studentRepository } from "@/src/repositories/studentRepository";
import { branchService } from "@/src/services/branchService";
import Skeleton from "@/src/components/core/Skeleton";

interface StudentApiResponse {
  ID?: number;
  id?: number;
  userId?: number;
  studentId?: string;
  user?: {
    ID?: number;
    id?: number;
    name?: string;
    email?: string;
    profile?: {
      avatar?: string;
    };
    CreatedAt?: string;
    createdAt?: string;
  };
  branchId?: number;
  branch?: {
    ID?: number;
    id?: number;
    name?: string;
    Name?: string;
  };
  gender?: string;
  district?: string;
  birthYear?: number;
  enrollmentYear?: number;
  CreatedAt?: string;
  createdAt?: string;
}

interface ProgrammeStudent {
  id: number;
  userId?: number;
  studentId?: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  branchId?: number;
  branch?: {
    id: number;
    name: string;
  };
  gender?: string;
  district?: string;
  birthYear?: number;
  enrollmentYear?: number;
  createdAt?: string;
}

interface ParsedStudent {
  name: string;
  email: string;
}

export default function ProgrammeStudentsPage() {
  const router = useRouter();
  const params = useParams<{ departmentId?: string | string[]; courseId?: string | string[] }>();

  const departmentId = useMemo(() => {
    const value = params?.departmentId;
    if (Array.isArray(value)) {
      return value[0] || "";
    }
    return value || "";
  }, [params?.departmentId]);

  const courseId = useMemo(() => {
    const value = params?.courseId;
    if (Array.isArray(value)) {
      return value[0] || "";
    }
    return value || "";
  }, [params?.courseId]);

  const { showSuccess, showError } = useToast();
  const [department, setDepartment] = useState<DepartmentI | null>(null);
  const [course, setCourse] = useState<CourseI | null>(null);
  const [students, setStudents] = useState<ProgrammeStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [isApiImporting, setIsApiImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    district: "",
    universityBranch: "",
    branchId: "",
    birthYear: "",
    enrollmentYear: "",
  });
  const [branches, setBranches] = useState<Array<{ id: number; name: string }>>([]);
  const [errors, setErrors] = useState<{ name?: string; email?: string; enrollmentYear?: string }>({});
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkStudents, setBulkStudents] = useState<ParsedStudent[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [apiInputMode, setApiInputMode] = useState<"url" | "json">("url");
  const [apiJsonInput, setApiJsonInput] = useState("");
  const [apiConfig, setApiConfig] = useState({
    url: "",
    apiKey: "",
    dataPath: "data",
  });
  const [apiFetchLoading, setApiFetchLoading] = useState(false);
  const [apiFetchedData, setApiFetchedData] = useState<any[]>([]);
  const [apiFields, setApiFields] = useState<string[]>([]);
  const [apiNameFields, setApiNameFields] = useState<string[]>([]);
  const [apiEmailFields, setApiEmailFields] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiPreview, setApiPreview] = useState<ParsedStudent[]>([]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserI | null>(null);
  const [editingStudent, setEditingStudent] = useState<UserI | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!departmentId || !courseId || departmentId.trim() === "" || courseId.trim() === "") {
      return;
    }
    loadData();
  }, [departmentId, courseId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load department
      const departmentsResponse = await GET<SourceDepartment[]>("api/v1/departments");
      const rawDepartments = Array.isArray(departmentsResponse.data) ? departmentsResponse.data : [];
      const normalizedDepartments = rawDepartments.map(transformDepartment);

      const numericDeptId = parseInt(departmentId, 10);
      if (Number.isNaN(numericDeptId)) {
        showError("Invalid department identifier provided in the URL.");
        return;
      }

      const matchingDepartment = normalizedDepartments.find((dept) => dept.id === numericDeptId) || null;
      if (!matchingDepartment) {
        showError("Department not found or no longer accessible.");
        return;
      }

      setDepartment(matchingDepartment);

      // Load course
      const coursesResponse = await GET<SourceCourse[]>(`api/v1/courses?dept=${numericDeptId}`);
      const rawCourses = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
      const courseList = transformCourses(rawCourses);

      if (!courseId || courseId.trim() === "") {
        showError("Invalid programme identifier provided in the URL.");
        return;
      }

      const numericCourseId = parseInt(courseId.trim(), 10);

      if (Number.isNaN(numericCourseId) || numericCourseId < 0) {
        showError("Invalid programme identifier provided in the URL.");
        return;
      }

      const matchingCourse = courseList.find((c) => c.id === numericCourseId) || null;
      if (!matchingCourse) {
        showError("Programme not found or no longer accessible.");
        return;
      }

      setCourse(matchingCourse);

      // Load branches
      try {
        const { branchService } = await import("@/src/services/branchService");
        const branchesData = await branchService.getAllBranches();
        setBranches(branchesData.map(b => ({ id: b.id, name: b.name })));
      } catch (branchError) {
        console.error("Failed to load branches:", branchError);
        // Don't fail the whole page if branches fail to load
      }

      // Load students
      const studentResponse = await GET<StudentApiResponse[]>(`api/v1/students?course=${numericCourseId}`);
      const payload = Array.isArray(studentResponse.data) ? studentResponse.data : [];
      const transformedStudents = payload.map((student, index) => transformStudentResponse(student, index));
      setStudents(transformedStudents);
    } catch (error) {
      console.error("Failed to load data:", error);
      showError("Failed to load programme students");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (!parts.length) return "ST";
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
    return initials || "ST";
  };

  const transformStudentResponse = (student: StudentApiResponse, fallbackIndex: number): ProgrammeStudent => {
    const name = student.user?.name?.trim() || "Unnamed student";
    const studentRecordId = student.ID ?? student.id ?? fallbackIndex;
    const userId = student.user?.ID ?? student.user?.id ?? student.userId;
    const studentId = student.studentId; // The Strikeforce ID
    const createdAt = student.user?.CreatedAt || student.user?.createdAt || student.CreatedAt || student.createdAt;

    return {
      id: studentRecordId,
      userId: userId,
      studentId: studentId, // Strikeforce ID
      name,
      email: student.user?.email || "No email",
      avatar: student.user?.profile?.avatar,
      initials: getInitials(name),
      branchId: student.branchId ?? student.branch?.ID ?? student.branch?.id,
      branch: student.branch ? {
        id: student.branch.ID ?? student.branch.id ?? 0,
        name: student.branch.name ?? student.branch.Name ?? "Unknown Branch",
      } : undefined,
      gender: student.gender,
      district: student.district,
      birthYear: student.birthYear,
      enrollmentYear: student.enrollmentYear,
      createdAt: createdAt,
    };
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; enrollmentYear?: string } = {};
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Student name is required";
    }
    // Only validate email when creating (not editing)
    if (!editingStudent) {
      if (!formData.email || formData.email.trim().length === 0) {
        newErrors.email = "Email is required";
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }
    if (!formData.enrollmentYear || formData.enrollmentYear.trim().length === 0) {
      newErrors.enrollmentYear = "Enrollment year is required";
    } else {
      const year = parseInt(formData.enrollmentYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 2000 || year > currentYear + 1) {
        newErrors.enrollmentYear = `Enrollment year must be between 2000 and ${currentYear + 1}`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = (value: string) => emailRegex.test(value.trim());

  const parseCSVContent = (content: string): ParsedStudent[] => {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return [];
    }

    let dataLines = lines;
    let nameIdx = 0;
    let emailIdx = 1;

    const headerColumns = lines[0].split(",").map((col) => col.trim().toLowerCase());
    const headerHasEmail = headerColumns.includes("email");

    if (headerHasEmail) {
      dataLines = lines.slice(1);
      nameIdx = headerColumns.indexOf("name");
      emailIdx = headerColumns.indexOf("email");

      if (nameIdx === -1) {
        nameIdx = emailIdx === 0 ? 1 : 0;
      }
      if (emailIdx === -1) {
        emailIdx = headerColumns.length - 1;
      }
    }

    return dataLines
      .map((row) => {
        const cols = row.split(",").map((value) => value.trim());
        return {
          name: (cols[nameIdx] || "").trim(),
          email: (cols[emailIdx] || "").trim(),
        };
      })
      .filter((entry) => entry.email.length > 0 && isValidEmail(entry.email));
  };

  const handleBulkFileSelect = (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const textContent = String(reader.result || "");
      setBulkText(textContent);
      const parsed = parseCSVContent(textContent);
      setBulkStudents(parsed);
      setBulkError(parsed.length ? null : "No valid rows were detected in this file.");
    };
    reader.readAsText(file);
  };

  const handleManualParse = () => {
    const parsed = parseCSVContent(bulkText);
    setBulkStudents(parsed);
    setBulkError(parsed.length ? null : "Enter at least one row with name and email.");
  };

  const getNumericCourseId = () => {
    if (!courseId || courseId.trim() === "") {
      return null;
    }
    const parsed = parseInt(courseId.trim(), 10);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return parsed;
  };

  const openBulkModal = () => {
    setBulkModalOpen(true);
    setBulkError(null);
  };

  const closeBulkModal = () => {
    setBulkModalOpen(false);
    setBulkText("");
    setBulkStudents([]);
    setBulkError(null);
  };

  const openApiModal = () => {
    setApiModalOpen(true);
    setApiError(null);
    setApiFetchedData([]);
    setApiFields([]);
    setApiPreview([]);
    setApiNameFields([]);
    setApiEmailFields([]);
  };

  const closeApiModal = () => {
    setApiModalOpen(false);
    setApiError(null);
    setApiFetchedData([]);
    setApiFields([]);
    setApiPreview([]);
    setApiNameFields([]);
    setApiEmailFields([]);
    setApiJsonInput("");
    setApiInputMode("url");
    setShowApiKey(false);
  };

  const handleBulkSubmit = async () => {
    const numericCourseId = getNumericCourseId();
    if (numericCourseId === null) {
      showError("Invalid programme identifier. Please refresh and try again.");
      return;
    }

    if (bulkStudents.length === 0) {
      setBulkError("Add at least one student before importing.");
      return;
    }

    const sanitized = bulkStudents
      .map((student) => ({
        name: student.name,
        email: student.email.trim(),
      }))
      .filter((student) => student.email && isValidEmail(student.email));

    if (!sanitized.length) {
      setBulkError("No valid email addresses were detected. Please review your data.");
      return;
    }

    const payload = {
      students: sanitized,
    };

    try {
      setIsBulkUploading(true);
      await POST(`api/v1/students/${numericCourseId}/bulk`, payload);
      showSuccess(`Successfully started import for ${payload.students.length} students.`);
      setBulkModalOpen(false);
      setBulkText("");
      setBulkStudents([]);
      setBulkError(null);
      await loadData();
    } catch (error) {
      console.error("Bulk upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setBulkError(errorMessage);
      showError(`Failed to import students: ${errorMessage}`);
    } finally {
      setIsBulkUploading(false);
    }
  };

  const resolveFieldValue = (record: any, field: string) => {
    if (!record || !field) return "";
    return record[field];
  };

  const combineFields = (record: any, fields: string[]) => {
    if (!fields.length) return "";
    return fields
      .map((field) => {
        const value = resolveFieldValue(record, field);
        if (value === undefined || value === null) return "";
        if (typeof value === "string" || typeof value === "number") {
          return String(value).trim();
        }
        return "";
      })
      .filter(Boolean)
      .join(" ")
      .trim();
  };

  const mapApiRecordsToStudents = (records: any[]): ParsedStudent[] => {
    return records.map((record, index) => {
      const name = combineFields(record, apiNameFields) || `Student ${index + 1}`;
      const email = combineFields(record, apiEmailFields).trim();
      return { name, email };
    });
  };

  const handleFetchApiData = async () => {
    if (!apiConfig.url.trim()) {
      setApiError("API URL is required.");
      return;
    }

    try {
      setApiFetchLoading(true);
      setApiError(null);
      setApiFetchedData([]);
      setApiFields([]);
      setApiPreview([]);
      const headers: Record<string, string> = {};
      if (apiConfig.apiKey.trim()) {
        headers["Authorization"] = apiConfig.apiKey.trim();
        headers["x-api-key"] = apiConfig.apiKey.trim();
      }

      const response = await fetch(apiConfig.url.trim(), {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = await response.json();
      const path = apiConfig.dataPath.trim();

      let records = extractData(json, path);

      // If path extraction returned undefined or null, try fallbacks
      if (records === undefined || records === null) {
        // Try common paths
        if (Array.isArray(json.data)) {
          records = json.data;
        } else if (Array.isArray(json.results)) {
          records = json.results;
        } else if (Array.isArray(json.items)) {
          records = json.items;
        } else if (Array.isArray(json)) {
          records = json;
        } else {
          throw new Error(
            `Could not find an array at path "${path}". ` +
            `Try paths like "data", "data.students", "response.data", or leave empty if the root is an array.`
          );
        }
      }

      if (!Array.isArray(records)) {
        throw new Error(
          `The value at path "${path}" is not an array. ` +
          `Found: ${typeof records}. Update the Data Path to point to an array.`
        );
      }

      const normalized = records.filter((entry) => entry && typeof entry === "object");
      if (!normalized.length) {
        throw new Error("No record objects found in the API response.");
      }

      setApiFetchedData(normalized);
      setApiFields(Object.keys(normalized[0] || {}));
      setApiNameFields([]);
      setApiEmailFields([]);
    } catch (error) {
      console.error("Failed to fetch API data:", error);
      setApiError(error instanceof Error ? error.message : "Failed to fetch API data.");
    } finally {
      setApiFetchLoading(false);
    }
  };

  // Helper to extract data from nested path
  const extractData = (source: any, pathValue: string): any => {
    if (!pathValue || pathValue === "") {
      return source;
    }

    const keys = pathValue.split(".").filter(Boolean);
    if (keys.length === 0) {
      return source;
    }

    let current = source;
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    return current;
  };

  const handleParseJsonInput = () => {
    if (!apiJsonInput.trim()) {
      setApiError("Please enter JSON data.");
      return;
    }

    try {
      setApiError(null);
      setApiFetchedData([]);
      setApiFields([]);
      setApiPreview([]);

      const json = JSON.parse(apiJsonInput);

      // Automatically detect the array - try common patterns
      let records: any[] | null = null;

      if (Array.isArray(json)) {
        // Root is an array
        records = json;
      } else if (Array.isArray(json.data)) {
        records = json.data;
      } else if (Array.isArray(json.results)) {
        records = json.results;
      } else if (Array.isArray(json.items)) {
        records = json.items;
      } else if (Array.isArray(json.students)) {
        records = json.students;
      } else if (Array.isArray(json.users)) {
        records = json.users;
      } else {
        // Try to find the first array value in the object
        for (const key in json) {
          if (Array.isArray(json[key])) {
            records = json[key];
            break;
          }
        }
      }

      if (!records || !Array.isArray(records)) {
        throw new Error(
          "Could not find an array in the JSON. " +
          "The JSON should contain an array directly or as a property (e.g., 'data', 'results', 'items')."
        );
      }

      const normalized = records.filter((entry) => entry && typeof entry === "object");
      if (!normalized.length) {
        throw new Error("No record objects found in the JSON data.");
      }

      setApiFetchedData(normalized);
      setApiFields(Object.keys(normalized[0] || {}));
      setApiNameFields([]);
      setApiEmailFields([]);
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      setApiError(error instanceof Error ? error.message : "Failed to parse JSON data.");
    }
  };

  useEffect(() => {
    if (!apiFetchedData.length || (!apiNameFields.length && !apiEmailFields.length)) {
      setApiPreview([]);
      return;
    }
    const mapped = mapApiRecordsToStudents(apiFetchedData)
      .filter((entry) => entry.email && isValidEmail(entry.email));
    setApiPreview(mapped.slice(0, 10));
  }, [apiFetchedData, apiNameFields, apiEmailFields]);

  const handleApiImport = async () => {
    const numericCourseId = getNumericCourseId();
    if (numericCourseId === null) {
      showError("Invalid programme identifier. Please refresh and try again.");
      return;
    }

    if (!apiFetchedData.length) {
      setApiError("Fetch data first before importing.");
      return;
    }

    if (!apiEmailFields.length) {
      setApiError("Select at least one field to use as the email address.");
      return;
    }

    const mapped = mapApiRecordsToStudents(apiFetchedData).filter((entry) => entry.email && isValidEmail(entry.email));
    if (!mapped.length) {
      setApiError("No valid students could be derived from the API response.");
      return;
    }

    const payload = {
      students: mapped,
    };

    try {
      setIsApiImporting(true);
      await POST(`api/v1/students/${numericCourseId}/bulk`, payload);
      showSuccess(`Imported ${mapped.length} students from API.`);
      setApiModalOpen(false);
      setApiFetchedData([]);
      setApiFields([]);
      setApiPreview([]);
      await loadData();
    } catch (error) {
      console.error("API import failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setApiError(errorMessage);
      showError(`Failed to import students: ${errorMessage}`);
    }
  };

  const MultiFieldSelect = ({
    title,
    options,
    selected,
    onChange,
    helperText,
  }: {
    title: string;
    options: string[];
    selected: string[];
    onChange: (values: string[]) => void;
    helperText?: string;
  }) => {
    const toggleValue = (value: string) => {
      if (selected.includes(value)) {
        onChange(selected.filter((item) => item !== value));
      } else {
        onChange([...selected, value]);
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{title}</p>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-primary underline"
            >
              Clear
            </button>
          )}
        </div>
        {helperText && <p className="text-xs text-muted">{helperText}</p>}
        <div className="flex flex-wrap gap-2">
          {options.length === 0 && <p className="text-xs text-muted">Fetch data to view available fields.</p>}
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => toggleValue(option)}
              className={`px-3 py-1 rounded-full border text-xs ${selected.includes(option)
                  ? "bg-primary text-white border-primary"
                  : "border-custom text-secondary"
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      if (editingStudent) {
        // Update existing student
        const studentId = typeof editingStudent.id === 'number' ? editingStudent.id : parseInt(editingStudent.id.toString(), 10);
        const payload = {
          name: formData.name.trim(),
          gender: formData.gender || "",
          district: formData.district || "",
          branchId: formData.branchId ? parseInt(formData.branchId, 10) : undefined,
          birthYear: formData.birthYear ? parseInt(formData.birthYear, 10) : 0,
          enrollmentYear: formData.enrollmentYear ? parseInt(formData.enrollmentYear, 10) : 0,
        };

        await PUT(`api/v1/students/${studentId}`, payload);
        showSuccess("Student updated successfully!");
        handleClose();
        await loadData();
      } else {
        // Create new student
        if (!courseId || courseId.trim() === "") {
          showError("Invalid course identifier");
          return;
        }

        const numericCourseId = parseInt(courseId.trim(), 10);
        if (Number.isNaN(numericCourseId)) {
          showError("Invalid course identifier");
          return;
        }

        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          gender: formData.gender || "",
          district: formData.district || "",
          universityBranch: formData.universityBranch || "",
          branchId: formData.branchId ? parseInt(formData.branchId, 10) : undefined,
          birthYear: formData.birthYear ? parseInt(formData.birthYear, 10) : 0,
          enrollmentYear: formData.enrollmentYear ? parseInt(formData.enrollmentYear, 10) : 0,
        };

        const response = await POST<{ msg?: string }>(`api/v1/students/${numericCourseId}`, payload);
        showSuccess(response?.msg || `Student created successfully! Login credentials have been sent to ${formData.email}`);
        handleClose();
        await loadData();
      }
    } catch (error) {
      console.error(`Failed to ${editingStudent ? 'update' : 'add'} student:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showError(`Failed to ${editingStudent ? 'update' : 'add'} student: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = () => {
    setFormData({ name: "", email: "", gender: "", district: "", universityBranch: "", branchId: "", birthYear: "", enrollmentYear: "" });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({ name: "", email: "", gender: "", district: "", universityBranch: "", branchId: "", birthYear: "", enrollmentYear: "" });
    setErrors({});
  };

  const handleEditStudent = (student: UserI) => {
    const studentData = student as ProgrammeStudent;
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      gender: studentData.gender || "",
      district: studentData.district || "",
      universityBranch: "",
      branchId: studentData.branchId?.toString() || studentData.branch?.id?.toString() || "",
      birthYear: studentData.birthYear?.toString() || "",
      enrollmentYear: studentData.enrollmentYear?.toString() || "",
    });
    setIsDetailsModalOpen(false);
    setIsModalOpen(true);
  };

  const handleViewDetails = (student: UserI) => {
    setSelectedStudent(student);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (studentId: string) => {
    setStudentToDelete(studentId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await studentRepository.deleteStudentByUserId(studentToDelete);
      showSuccess("Student deleted successfully");
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete student:", error);
      showError("Failed to delete student. Please try again.");
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  const handleSuspend = async (studentId: string) => {
    try {
      // TODO: Implement suspend endpoint
      showError("Suspend functionality not yet implemented");
    } catch (error) {
      console.error("Failed to suspend student:", error);
      showError("Failed to suspend student. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-full">
        {/* Header Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton width={160} height={40} rounded="md" />
            <Skeleton width={120} height={40} rounded="md" />
            <Skeleton width={140} height={40} rounded="md" />
          </div>
        </div>

        <div className="mb-6">
          <Skeleton width={300} height={24} rounded="md" className="mb-2" />
          <Skeleton width={400} height={16} rounded="md" />
        </div>

        {/* Students Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-paper rounded-lg p-6 shadow-custom">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton width={48} height={48} rounded="full" />
                <div className="flex-1">
                  <Skeleton width={150} height={18} rounded="md" className="mb-2" />
                  <Skeleton width={200} height={14} rounded="md" />
                </div>
              </div>
              <Skeleton width="100%" height={14} rounded="md" className="mb-2" />
              <Skeleton width="80%" height={14} rounded="md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!departmentId || !courseId) {
    return (
      <div className="w-full flex flex-col min-h-full items-center justify-center p-8 text-center">
        <p className="text-secondary">Missing identifiers. Please navigate from the programmes page.</p>
        <Button className="mt-4 bg-primary" onClick={() => router.push("/university-admin/departments")}>
          Go back to departments
        </Button>
      </div>
    );
  }

  if (!department || !course) {
    return (
      <div className="w-full flex flex-col min-h-full items-center justify-center p-8 text-center">
        <p className="text-secondary">Programme or department not found. Please return to the departments list.</p>
        <Button className="mt-4 bg-primary" onClick={() => router.push("/university-admin/departments")}>
          Go back to departments
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => router.push(`/university-admin/departments/${departmentId}/courses`)}
            className="px-6 py-3 rounded flex gap-2 items-center justify-center min-w-max cursor-pointer bg-pale text-primary"
          >
            <ArrowLeft size={16} />
            Back to Programmes
          </Button>
          <Button onClick={handleCreate} className="bg-primary">
            <Plus size={16} className="mr-2" />
            Add Student
          </Button>
          <Button onClick={openBulkModal} className="bg-pale text-primary">
            Bulk Upload
          </Button>
          {devMode && (
            <Button onClick={openApiModal} className="bg-pale text-primary">
              Add via API
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-secondary">Dev Mode</span>
          <button
            type="button"
            onClick={() => setDevMode((prev) => !prev)}
            className="relative inline-flex items-center flex-shrink-0 rounded-full transition-colors duration-200"
            style={{
              width: "3rem",
              height: "1.5rem",
              backgroundColor: devMode ? "var(--primary)" : "var(--border)",
            }}
          >
            <span
              className="inline-block bg-white rounded-full shadow transition-transform duration-200"
              style={{
                width: "1.25rem",
                height: "1.25rem",
                transform: devMode ? "translateX(1.5rem)" : "translateX(0.125rem)",
              }}
            />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-[1rem] font-[600] mb-2">{course.name}</h1>
        <p className="text-[0.875rem] opacity-60">
          Students enrolled in this programme
        </p>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 bg-paper rounded-lg">
          <p className="text-[0.875rem] opacity-60">
            No students yet enrolled in {course.name}. Students will appear here once they are added to this programme.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => {
            // Convert ProgrammeStudent to UserI for the modal
            // Use userId if available (for group matching), otherwise fall back to student.id
            const userId = student.userId || student.id;
            const userStudent: UserI & ProgrammeStudent = {
              id: userId,
              name: student.name,
              email: student.email,
              role: "student",
              profile: {
                avatar: student.avatar || "",
                bio: "",
                skills: [],
                phone: "",
                location: "",
              },
              courseId: course?.id,
              departmentId: department?.id,
              createdAt: student.createdAt || "",
              updatedAt: "",
              // Include all student-specific fields
              userId: student.userId,
              studentId: student.studentId, // Strikeforce ID
              studentRecordId: student.id, // Student record ID (for DNA snapshot endpoint)
              branchId: student.branchId,
              branch: student.branch,
              gender: student.gender,
              district: student.district,
              birthYear: student.birthYear,
              enrollmentYear: student.enrollmentYear,
            };

            return (
              <div
                key={student.id}
                onClick={() => {
                  setSelectedStudent(userStudent);
                  setIsDetailsModalOpen(true);
                }}
                className="bg-paper rounded-lg p-6 shadow-custom flex flex-col gap-3 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="h-12 w-12 rounded-full object-cover border border-pale"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-pale flex items-center justify-center text-primary font-semibold">
                      {student.initials}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-[0.95rem] font-semibold">{student.name}</p>
                    <p className="text-xs text-muted">{student.email}</p>
                    {student.studentId && (
                      <p className="text-[0.7rem] opacity-50 font-mono mt-1">
                        Strikeforce ID: {student.studentId}
                      </p>
                    )}
                    {/* DNA Snapshot Status */}
                    {(student as any).hasCompletedDnaSnapshot !== undefined && (
                      <div className="mt-2">
                        <span
                          className={`text-[0.7rem] px-2 py-0.5 rounded-full ${(student as any).hasCompletedDnaSnapshot
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {(student as any).hasCompletedDnaSnapshot ? "✓ DNA Complete" : "DNA Pending"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Students"
        open={bulkModalOpen}
        handleClose={closeBulkModal}
        actions={[
          <Button
            key="cancel"
            onClick={closeBulkModal}
            className="bg-pale text-primary"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={handleBulkSubmit}
            className="bg-primary"
            disabled={bulkStudents.length === 0}
            loading={isBulkUploading}
          >
            Import Students
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Upload a CSV file with columns <strong>name</strong> and <strong>email</strong> or paste the rows below.
          </p>
          <FileUpload accept=".csv" onFileSelect={handleBulkFileSelect} />
          <TextArea
            title="Paste CSV Rows"
            placeholder="Example: Jane Doe,jane@example.com"
            rows={6}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <Button onClick={handleManualParse} className="bg-pale text-primary">
            Parse Entries
          </Button>
          {bulkError && <p className="text-xs text-red-500">{bulkError}</p>}
          {bulkStudents.length > 0 && (
            <div>
              <p className="text-xs text-muted mb-2">
                Preview ({Math.min(bulkStudents.length, 5)} of {bulkStudents.length} students)
              </p>
              <div className="max-h-48 overflow-auto border border-dashed border-custom rounded-lg divide-y divide-custom">
                {bulkStudents.slice(0, 5).map((student, index) => (
                  <div key={`${student.email}-${index}`} className="flex justify-between text-sm p-2">
                    <span className="text-default">{student.name || "Unnamed"}</span>
                    <span className="text-secondary">{student.email}</span>
                  </div>
                ))}
              </div>
              {bulkStudents.length > 5 && (
                <p className="text-[0.75rem] text-muted mt-2">Only the first 5 records are shown.</p>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* API Import Modal */}
      <Modal
        title="Add Students via API"
        open={apiModalOpen}
        handleClose={closeApiModal}
        actions={[
          <Button
            key="cancel"
            onClick={closeApiModal}
            className="bg-pale text-primary"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={handleApiImport}
            className="bg-primary"
            disabled={!apiFetchedData.length}
            loading={isApiImporting}
          >
            Import Students
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <Input
            title="API URL"
            value={apiConfig.url}
            onChange={(e) => setApiConfig({ ...apiConfig, url: e.target.value })}
            placeholder="https://api.example.com/students"
          />
          <div className="flex flex-col gap-1">
            <p className="mb-3 text-sm">API Key (optional)</p>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiConfig.apiKey}
                onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                placeholder="Bearer ..."
                className="border p-3 pr-10 text-base border-custom rounded-lg outline-none focus:border-primary w-full"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-default transition-colors"
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <JsonEditor
            title="JSON Response"
            value={apiJsonInput}
            onChange={setApiJsonInput}
            placeholder='{\n  "data": [\n    {\n      "name": "John Doe",\n      "email": "john@example.com"\n    }\n  ]\n}'
            rows={12}
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleParseJsonInput} className="bg-pale text-primary">
              Parse JSON
            </Button>
            {apiFetchedData.length > 0 && (
              <span className="text-xs text-muted">{apiFetchedData.length} record(s) loaded.</span>
            )}
          </div>
          {apiError && <p className="text-xs text-red-500">{apiError}</p>}
          {apiFields.length > 0 && (
            <>
              <MultiFieldSelect
                title="Fields to build the student name"
                options={apiFields}
                selected={apiNameFields}
                onChange={setApiNameFields}
                helperText="Select one or more fields. They will be concatenated in order."
              />
              <MultiFieldSelect
                title="Fields to use as the email"
                options={apiFields}
                selected={apiEmailFields}
                onChange={setApiEmailFields}
                helperText="Select at least one field that contains the student's email address."
              />
            </>
          )}
          {apiPreview.length > 0 && (
            <div>
              <p className="text-xs text-muted mb-2">
                Preview ({Math.min(apiPreview.length, 5)} of {apiFetchedData.length} students)
              </p>
              <div className="max-h-48 overflow-auto border border-dashed border-custom rounded-lg divide-y divide-custom">
                {apiPreview.slice(0, 5).map((student, index) => (
                  <div key={`${student.email}-${index}`} className="flex justify-between text-sm p-2">
                    <span className="text-default">{student.name || "Unnamed"}</span>
                    <span className="text-secondary">{student.email}</span>
                  </div>
                ))}
              </div>
              {apiPreview.length > 5 && (
                <p className="text-[0.75rem] text-muted mt-2">Only the first 5 records are shown.</p>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Add/Edit Student Modal */}
      <Modal
        title={editingStudent ? "Edit Student" : "Add Student"}
        open={isModalOpen}
        handleClose={handleClose}
        actions={[
          <Button key="cancel" onClick={handleClose} className="bg-pale text-primary">
            Cancel
          </Button>,
          <Button key="submit" onClick={handleSubmit} className="bg-primary" loading={isSubmitting}>
            {editingStudent ? "Update Student" : "Add Student"}
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-muted mb-1">Programme</p>
            <p className="text-sm font-medium">{course.name}</p>
          </div>
          <Input
            title="Student Name *"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            placeholder="e.g., John Doe"
            error={errors.name}
          />
          <Input
            title="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            placeholder="e.g., john.doe@example.com"
            error={errors.email}
            disabled={!!editingStudent}
          />
          <Select
            title="Gender"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
              { value: "prefer-not-to-say", label: "Prefer not to say" },
            ]}
            value={formData.gender}
            onChange={(option) => {
              const value =
                typeof option === "string"
                  ? option
                  : typeof option === "object" && "value" in option
                    ? String(option.value)
                    : "";
              setFormData({ ...formData, gender: value });
            }}
            placeHolder="Select gender"
          />
          <Select
            title="University Branch"
            options={branches.map((branch) => ({
              value: branch.id.toString(),
              label: branch.name,
            }))}
            value={formData.branchId}
            onChange={(option) => {
              const value =
                typeof option === "string"
                  ? option
                  : typeof option === "object" && "value" in option
                    ? String(option.value)
                    : "";
              setFormData({ ...formData, branchId: value });
            }}
            placeHolder="Select branch"
          />
          <Select
            title="Birth Year"
            searchable={true}
            options={(() => {
              const currentYear = new Date().getFullYear();
              const startYear = currentYear - 40; // 40 years ago (typical max age for students)
              const endYear = currentYear - 15; // 15 years ago (typical min age for students)
              const years = [];
              for (let year = endYear; year >= startYear; year--) {
                years.push({ value: year.toString(), label: year.toString() });
              }
              return years;
            })()}
            value={formData.birthYear}
            onChange={(option) => {
              const value =
                typeof option === "string"
                  ? option
                  : typeof option === "object" && "value" in option
                    ? String(option.value)
                    : "";
              setFormData({ ...formData, birthYear: value });
            }}
            placeHolder="Type or select birth year"
          />
          <Select
            title="Enrollment Year *"
            searchable={true}
            options={(() => {
              const currentYear = new Date().getFullYear();
              const startYear = 2000;
              const endYear = currentYear + 1; // Allow next year for early enrollment
              const years = [];
              for (let year = endYear; year >= startYear; year--) {
                years.push({ value: year.toString(), label: year.toString() });
              }
              return years;
            })()}
            value={formData.enrollmentYear}
            onChange={(option) => {
              const value =
                typeof option === "string"
                  ? option
                  : typeof option === "object" && "value" in option
                    ? String(option.value)
                    : "";
              setFormData({ ...formData, enrollmentYear: value });
              if (errors.enrollmentYear) {
                setErrors({ ...errors, enrollmentYear: undefined });
              }
            }}
            placeHolder="Type or select enrollment year"
            error={errors.enrollmentYear}
          />
          <p className="text-[0.8125rem] opacity-60">
            A random password will be generated and sent to the student's email address with a login link.
          </p>
        </div>
      </Modal>

      {/* Student Details Modal */}
      <StudentDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        department={department || undefined}
        programme={course || undefined}
        onEdit={handleEditStudent}
        onDelete={handleDeleteClick}
        onSuspend={handleSuspend}
      />

      {/* Delete Confirmation */}
      <Modal
        title="Delete Student"
        open={showDeleteConfirm}
        handleClose={() => {
          setShowDeleteConfirm(false);
          setStudentToDelete(null);
        }}
        actions={[
          <Button
            key="cancel"
            onClick={() => {
              setShowDeleteConfirm(false);
              setStudentToDelete(null);
            }}
            className="bg-pale text-primary"
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            onClick={handleConfirmDelete}
            className="bg-primary"
          >
            Delete
          </Button>,
        ]}
      >
        <div className="space-y-2">
          <p>Are you sure you want to delete this student? This action cannot be undone.</p>
          <p className="text-[0.8125rem] opacity-75">All associated projects and data will be removed.</p>
        </div>
      </Modal>
    </div>
  );
}

