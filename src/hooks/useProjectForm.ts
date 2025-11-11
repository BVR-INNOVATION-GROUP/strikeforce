/**
 * Custom hook for project form state management
 */
import { useState, useEffect, useRef } from "react";
import { OptionI } from "@/src/components/core/Select";

export interface ProjectFormState {
  university: OptionI | undefined;
  department: OptionI | null;
  course: OptionI | null;
  currency: OptionI | null;
  title: string;
  desc: string;
  budget: string;
  deadline: string;
  capacity: string;
  selectedSkills: string[];
  attachments: File[];
}

export interface ProjectFormActions {
  setUniversity: (o: OptionI | string) => void;
  setDepartment: (o: OptionI | string) => void;
  setCourse: (o: OptionI | string) => void;
  setCurrency: (o: OptionI | string) => void;
  setTitle: (value: string) => void;
  setDesc: (value: string) => void;
  setBudget: (value: string) => void;
  setDeadline: (value: string) => void;
  setCapacity: (value: string) => void;
  setSelectedSkills: React.Dispatch<React.SetStateAction<string[]>>;
  setAttachments: (files: File[]) => void;
  toggleSkill: (skill: string) => void;
  resetForm: () => void;
}

/**
 * Hook for managing project form state
 * @param open - Whether the form modal is open
 * @param initialData - Optional initial data to populate form fields (for editing)
 */
export function useProjectForm(
  open: boolean,
  initialData?: Partial<{
    university: OptionI | undefined;
    department: OptionI | null;
    course: OptionI | null;
    currency: OptionI | null;
    title: string;
    desc: string;
    budget: string;
    deadline: string;
    capacity: string;
    selectedSkills: string[];
  }>
): [ProjectFormState, ProjectFormActions] {
  // Default currency to UGX
  const defaultCurrency: OptionI = {
    value: "UGX",
    label: "UGX - Ugandan Shilling",
    icon: "🇺🇬",
  };

  // Initialize with empty values - will be populated by useEffect when modal opens
  const [university, setUniversityState] = useState<OptionI | undefined>(
    undefined
  );
  const [department, setDepartmentState] = useState<OptionI | null>(null);
  const [course, setCourseState] = useState<OptionI | null>(null);
  const [currency, setCurrencyState] = useState<OptionI | null>(
    defaultCurrency
  );
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [capacity, setCapacity] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const resetForm = () => {
    setUniversityState(undefined);
    setDepartmentState(null);
    setCourseState(null);
    setCurrencyState(defaultCurrency);
    setTitle("");
    setDesc("");
    setBudget("");
    setDeadline("");
    setCapacity("");
    setSelectedSkills([]);
    setAttachments([]);
  };

  useEffect(() => {
    if (!open) {
      // resetForm();
    }
  }, [open]);

  // Track if we're initializing from initialData to prevent unwanted resets
  const isInitializingRef = useRef(false);

  // Populate form when modal opens with initialData (for edit mode)
  useEffect(() => {
    if (open && initialData) {
      isInitializingRef.current = true;
      // When modal opens with initial data, populate all form fields immediately
      // Set all values at once to prevent cascading resets
      // setUniversityState(initialData.university ?? undefined);
      // setDepartmentState(initialData.department ?? null);
      // setCourseState(initialData.course ?? null);
      // setCurrencyState(initialData.currency ?? defaultCurrency);
      // setTitle(initialData.title ?? "");
      // setDesc(initialData.desc ?? "");
      // setBudget(initialData.budget ?? "");
      // setDeadline(initialData.deadline ?? "");
      // setCapacity(initialData.capacity ?? "");
      // setSelectedSkills(initialData.selectedSkills ?? []);

      // Reset flag after effects have run (use setTimeout to ensure it happens after state updates)
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 0);
    }
  }, [open, initialData, defaultCurrency]);

  // Reset department and course when university changes (only if not initializing)
  // useEffect(() => {
  //   if (!isInitializingRef.current && university !== undefined) {
  //     setDepartmentState(null);
  //     setCourseState(null);
  //   }
  // }, [university]);

  // Reset course when department changes (only if not initializing)

  useEffect(() => {}, [department]);

  const setUniversity = (o: OptionI | string) => {
    setUniversityState(
      typeof o === "string" ? ({ value: o, label: o } as OptionI) : o
    );
  };

  const setDepartment = (o: OptionI | string) => {
    setDepartmentState(
      typeof o === "string" ? ({ value: o, label: o } as OptionI) : o
    );
  };

  const setCourse = (o: OptionI | string) => {
    setCourseState(
      typeof o === "string" ? ({ value: o, label: o } as OptionI) : o
    );
  };

  const setCurrency = (o: OptionI | string) => {
    setCurrencyState(
      typeof o === "string" ? ({ value: o, label: o } as OptionI) : o
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const state: ProjectFormState = {
    university,
    department,
    course,
    currency,
    title,
    desc,
    budget,
    deadline,
    capacity,
    selectedSkills,
    attachments,
  };

  const actions: ProjectFormActions = {
    setUniversity,
    setDepartment,
    setCourse,
    setCurrency,
    setTitle,
    setDesc,
    setBudget,
    setDeadline,
    setCapacity,
    setSelectedSkills,
    setAttachments,
    toggleSkill,
    resetForm,
  };

  return [state, actions];
}
