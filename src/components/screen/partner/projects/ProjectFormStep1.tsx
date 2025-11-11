/**
 * Project Form Step 1 - University, Department, Course, Skills Selection
 */
"use client";

import React, { useMemo, useEffect, useState } from "react";
import Select, { OptionI } from "@/src/components/core/Select";
import MultiSelect, { OptionI as MultiSelectOptionI } from "@/src/components/base/MultiSelect";
import { commonSkills } from "@/src/constants/universities";
import { organizationService } from "@/src/services/organizationService";
import { departmentService } from "@/src/services/departmentService";
import { courseService } from "@/src/services/courseService";
import { OrganizationI } from "@/src/models/organization";
import { DepartmentI, CourseI } from "@/src/models/project";

export interface Props {
  university: OptionI | undefined;
  department: OptionI | null;
  course: OptionI | null;
  selectedSkills: string[];
  errors: Record<string, string>;
  onUniversityChange: (value: OptionI | string) => void;
  onDepartmentChange: (value: OptionI | string) => void;
  onCourseChange: (value: OptionI | string) => void;
  onSkillToggle: (skill: string) => void;
  onSkillsChange?: (skills: string[]) => void;
  onClearError: (field: string) => void;
}

/**
 * Step 1 of project form - university selection and skills
 */
const ProjectFormStep1 = ({
  university,
  department,
  course,
  selectedSkills,
  errors,
  onUniversityChange,
  onDepartmentChange,
  onCourseChange,
  onSkillToggle,
  onSkillsChange,
  onClearError,
}: Props) => {
  const [universities, setUniversities] = useState<OrganizationI[]>([]);
  const [departments, setDepartments] = useState<DepartmentI[]>([]);
  const [courses, setCourses] = useState<CourseI[]>([]);
  const [/* loadingUniversities */, setLoadingUniversities] = useState(false);
  const [/* loadingDepartments */, setLoadingDepartments] = useState(false);
  const [/* loadingCourses */, setLoadingCourses] = useState(false);

  /**
   * Load all universities (organizations with type UNIVERSITY)
   */
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        setLoadingUniversities(true);
        const allOrgs = await organizationService.getAllOrganizations();
        // Filter for universities only
        const universityOrgs = allOrgs.filter((org) => org.type === "UNIVERSITY");
        setUniversities(universityOrgs);
      } catch (error) {
        console.error("Failed to load universities:", error);
      } finally {
        setLoadingUniversities(false);
      }
    };
    loadUniversities();
  }, []);

  /**
   * Load departments when university is selected
   */
  useEffect(() => {
    const loadDepartments = async () => {
      if (!university?.value) {
        setDepartments([]);
        return;
      }
      try {
        setLoadingDepartments(true);
        const depts = await departmentService.getAllDepartments(university.value);
        setDepartments(depts);
      } catch (error) {
        console.error("Failed to load departments:", error);
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };
    loadDepartments();
  }, [university?.value]);

  /**
   * Load courses when department is selected
   */
  useEffect(() => {
    const loadCourses = async () => {
      if (!department?.value) {
        setCourses([]);
        return;
      }
      try {
        setLoadingCourses(true);
        const courseList = await courseService.getAllCourses(department.value);
        setCourses(courseList);
      } catch (error) {
        console.error("Failed to load courses:", error);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, [department?.value]);

  /**
   * Convert universities to Select options
   */
  const getUniversities = (): OptionI[] => {
    return universities
      .filter((u) => u.id != university?.value)
      .map((u) => ({
        label: u.name,
        value: u.id.toString(),
        isSelected: university?.value === u.id.toString(),
      }));
  };

  /**
   * Convert departments to Select options
   */
  const getDepartments = (): OptionI[] => {
    return departments.map((d) => ({
      label: d.name,
      value: d.id.toString(),
    }));
  };

  /**
   * Convert courses to Select options
   */
  const getCourses = (): OptionI[] => {
    return courses.map((c) => ({
      label: c.name,
      value: c.id.toString(),
    }));
  };

  /**
   * Convert skills array to MultiSelect OptionI format
   */
  const skillOptions: MultiSelectOptionI[] = useMemo(() => {
    return commonSkills.map((skill) => ({
      label: skill,
      value: skill,
    }));
  }, []);

  /**
   * Convert selected skills (string[]) to MultiSelect OptionI[] format
   */
  const selectedSkillOptions: MultiSelectOptionI[] = useMemo(() => {
    return selectedSkills
      .map((skill) => skillOptions.find((opt) => opt.value === skill))
      .filter((opt): opt is MultiSelectOptionI => opt !== undefined);
  }, [selectedSkills, skillOptions]);

  /**
   * Handle skills change from MultiSelect
   * Converts OptionI[] back to string[]
   */
  const handleSkillsChange = (selectedOptions: MultiSelectOptionI[]) => {
    if (onSkillsChange) {
      // Use the new handler if provided
      const skillStrings = selectedOptions.map((opt) => opt.value as string);
      onSkillsChange(skillStrings);
    } else {
      // Fallback: use toggle for each skill to maintain compatibility
      // This is less efficient but maintains backward compatibility
      const newSkillSet = new Set(selectedOptions.map((opt) => opt.value as string));
      const currentSkillSet = new Set(selectedSkills);

      // Add newly selected skills
      newSkillSet.forEach((skill) => {
        if (!currentSkillSet.has(skill)) {
          onSkillToggle(skill);
        }
      });

      // Remove deselected skills
      currentSkillSet.forEach((skill) => {
        if (!newSkillSet.has(skill)) {
          onSkillToggle(skill);
        }
      });
    }
    onClearError("skills");
  };

  return (
    <>
      <Select
        placeHolder="Select the university"
        title="University *"
        onChange={(value) => {
          onUniversityChange(value);
          onClearError("university");
        }}
        value={university}
        options={getUniversities()}
        error={errors.university}
      />
      <Select
        placeHolder="Select the Department"
        title="Department *"
        onChange={(value) => {
          onDepartmentChange(value);
          onClearError("department");
        }}
        value={department}
        options={getDepartments()}
        error={errors.department}
      />
      <Select
        placeHolder="Select the Course"
        title="Course *"
        onChange={(value) => {
          onCourseChange(value);
          onClearError("course");
        }}
        value={course}
        options={getCourses()}
        error={errors.course}
      />
      <MultiSelect
        title="Skills Required *"
        options={skillOptions}
        value={selectedSkillOptions}
        onChange={handleSkillsChange}
        placeHolder="Select skills..."
        error={errors.skills}
      />
    </>
  );
};

export default ProjectFormStep1;

