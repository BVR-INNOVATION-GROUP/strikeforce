/**
 * Project Form Step 1 - University, Department, Course, Skills Selection
 */
"use client";

import React, { useMemo } from "react";
import Select, { OptionI } from "@/src/components/core/Select";
import MultiSelect, { OptionI as MultiSelectOptionI } from "@/src/components/base/MultiSelect";
import { topUgandanUniversities, University, commonSkills } from "@/src/constants/universities";

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
  const getUniversities = () => {
    return topUgandanUniversities
      ?.filter((o) => o?.id != university?.value)
      ?.map((u) => ({
        label: u.name,
        value: u.id,
        isSelected: university?.value === u.id,
      }));
  };

  const getDepartments = () => {
    if (university) {
      const foundUniversity = topUgandanUniversities?.find(
        (u) => u?.id == university?.value
      );
      return (
        foundUniversity?.departments?.map((d) => ({
          label: d?.name,
          value: d?.id,
        })) ?? []
      );
    }
    return [];
  };

  const getCourses = () => {
    if (department && university) {
      const foundUniversity = topUgandanUniversities?.find(
        (u) => u?.id == university?.value
      );
      const foundDepartment = foundUniversity?.departments?.find(
        (d) => d?.id == department?.value
      );
      return (
        foundDepartment?.courses?.map((c) => ({
          label: `${c.name} (Year ${c.year})`,
          value: c.id,
        })) ?? []
      );
    }
    return [];
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

