/**
 * Project Form Step 1 - University, Department, Course, Skills Selection
 */
"use client";

import React, { useMemo, useEffect, useState } from "react";
import Select, { OptionI } from "@/src/components/core/Select";
import MultiSelect, { OptionI as MultiSelectOptionI } from "@/src/components/base/MultiSelect";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import { allSkills } from "@/src/constants/universities";
import { organizationService } from "@/src/services/organizationService";
import { OrganizationI } from "@/src/models/organization";
import { Plus, X } from "lucide-react";

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
  // Store nested data structure: organizations -> departments -> courses
  const [nestedData, setNestedData] = useState<{
    id: number;
    name: string;
    type: string;
    departments: {
      id: number;
      name: string;
      courses: {
        id: number;
        name: string;
      }[];
    }[];
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customSkills, setCustomSkills] = useState<string[]>([]);

  /**
   * Initialize custom skills from selectedSkills
   * Custom skills are those that are not in the predefined allSkills list
   * Only run once on mount to avoid conflicts with user interactions
   */
  useEffect(() => {
    const custom = selectedSkills.filter(
      (skill) => skill !== "__OTHERS__" && !allSkills.includes(skill)
    );
    if (custom.length > 0) {
      setCustomSkills(custom);
      setShowCustomSkillInput(true);
    }
  }, []); // Only run on mount

  /**
   * Load nested organizations with departments and courses in a single call
   */
  useEffect(() => {
    const loadNestedData = async () => {
      try {
        setLoading(true);
        // Fetch nested data filtered by university type
        const nested = await organizationService.getNestedOrganizations("university");
        setNestedData(nested);
      } catch (error) {
        console.error("Failed to load nested organizations:", error);
        setNestedData([]);
      } finally {
        setLoading(false);
      }
    };
    loadNestedData();
  }, []);

  /**
   * When nestedData loads and we have a course selected, ensure it's still valid
   * This handles the case where course is set from initialData before nestedData loads
   * If the course exists in the loaded data but the label doesn't match, update it
   */
  useEffect(() => {
    if (course && nestedData.length > 0 && department && university && course.value) {
      const availableCourses = getCoursesForDepartment();
      const courseExists = availableCourses.some(
        (c) => c.id.toString() === course.value
      );
      
      // If course exists in available courses, ensure the label matches
      // This handles cases where the course label from initialData might be different
      if (courseExists) {
        const foundCourse = availableCourses.find(
          (c) => c.id.toString() === course.value
        );
        if (foundCourse && foundCourse.name !== course.label) {
          // Update the course label to match what's in the dropdown
          // This ensures the Select component can properly match and display it
          onCourseChange({
            value: course.value,
            label: foundCourse.name
          });
        }
      }
    }
  }, [nestedData, course?.value, department?.value, university?.value]);

  /**
   * Get departments for the selected university from nested data
   */
  const getDepartmentsForUniversity = () => {
    if (!university?.value) return [];
    const selectedOrg = nestedData.find(
      (org) => org.id.toString() === university.value
    );
    return selectedOrg?.departments || [];
  };

  /**
   * Get courses for the selected department from nested data
   */
  const getCoursesForDepartment = () => {
    if (!department?.value || !university?.value) return [];
    const selectedOrg = nestedData.find(
      (org) => org.id.toString() === university.value
    );
    if (!selectedOrg) return [];
    const selectedDept = selectedOrg.departments.find(
      (dept) => dept.id.toString() === department.value
    );
    return selectedDept?.courses || [];
  };

  /**
   * Convert universities to Select options
   */
  const getUniversities = (): OptionI[] => {
    return nestedData.map((org) => ({
      label: org.name,
      value: org.id.toString(),
      isSelected: university?.value === org.id.toString(),
    }));
  };

  /**
   * Convert departments to Select options
   */
  const getDepartments = (): OptionI[] => {
    return getDepartmentsForUniversity().map((dept) => ({
      label: dept.name,
      value: dept.id.toString(),
    }));
  };

  /**
   * Convert courses to Select options
   */
  const getCourses = (): OptionI[] => {
    return getCoursesForDepartment().map((course) => ({
      label: course.name,
      value: course.id.toString(),
    }));
  };

  /**
   * Convert skills array to MultiSelect OptionI format
   * Includes "Others" option for custom skills
   */
  const skillOptions: MultiSelectOptionI[] = useMemo(() => {
    const predefinedSkills = allSkills.map((skill) => ({
      label: skill,
      value: skill,
    }));
    
    // Add "Others" option at the end
    return [
      ...predefinedSkills,
      {
        label: "Others (Add Custom Skill)",
        value: "__OTHERS__",
      },
    ];
  }, []);

  /**
   * Convert selected skills (string[]) to MultiSelect OptionI[] format
   * Excludes custom skills and "__OTHERS__" from the selected options display
   */
  const selectedSkillOptions: MultiSelectOptionI[] = useMemo(() => {
    // Filter out custom skills and "__OTHERS__" from selectedSkills
    const predefinedSelected = selectedSkills.filter(
      (skill) => skill !== "__OTHERS__" && !customSkills.includes(skill)
    );
    
    return predefinedSelected
      .map((skill) => skillOptions.find((opt) => opt.value === skill))
      .filter((opt): opt is MultiSelectOptionI => opt !== undefined);
  }, [selectedSkills, skillOptions, customSkills]);

  /**
   * Check if "Others" option is selected
   */
  const isOthersSelected = useMemo(() => {
    return selectedSkills.includes("__OTHERS__");
  }, [selectedSkills]);

  /**
   * Handle skills change from MultiSelect
   * Converts OptionI[] back to string[]
   * Handles "Others" option separately
   */
  const handleSkillsChange = (selectedOptions: MultiSelectOptionI[]) => {
    const selectedValues = selectedOptions.map((opt) => opt.value as string);
    const othersWasSelected = selectedSkills.includes("__OTHERS__");
    const othersIsSelected = selectedValues.includes("__OTHERS__");

    // Show/hide custom skill input based on "Others" selection
    if (othersIsSelected && !othersWasSelected) {
      setShowCustomSkillInput(true);
    } else if (!othersIsSelected && othersWasSelected) {
      setShowCustomSkillInput(false);
      setCustomSkillInput("");
      // Remove custom skills when "Others" is deselected
      const skillsWithoutCustom = selectedSkills.filter(
        (skill) => !customSkills.includes(skill)
      );
      if (onSkillsChange) {
        onSkillsChange(skillsWithoutCustom);
      } else {
        customSkills.forEach((skill) => {
          if (selectedSkills.includes(skill)) {
            onSkillToggle(skill);
          }
        });
      }
      setCustomSkills([]);
    }

    // Combine predefined skills with custom skills
    // Only include custom skills that aren't already in selectedValues to avoid duplicates
    const predefinedSelected = selectedValues.filter((v) => v !== "__OTHERS__");
    const customSkillsToAdd = customSkills.filter((skill) => !predefinedSelected.includes(skill));
    
    const allSelectedSkills = [
      ...predefinedSelected,
      ...customSkillsToAdd,
      ...(othersIsSelected ? ["__OTHERS__"] : []),
    ];

    if (onSkillsChange) {
      onSkillsChange(allSelectedSkills);
    } else {
      // Fallback: use toggle for each skill
      const newSkillSet = new Set(allSelectedSkills);
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

  /**
   * Handle adding a custom skill
   */
  const handleAddCustomSkill = () => {
    const trimmedSkill = customSkillInput.trim();
    if (!trimmedSkill) return;

    // Check if skill already exists (predefined or custom)
    if (
      allSkills.includes(trimmedSkill) ||
      customSkills.includes(trimmedSkill) ||
      selectedSkills.includes(trimmedSkill)
    ) {
      return;
    }

    // Add custom skill to state
    const newCustomSkills = [...customSkills, trimmedSkill];
    setCustomSkills(newCustomSkills);

    // Update selected skills - include all existing skills (excluding __OTHERS__), add new custom skill, and keep __OTHERS__ if it was selected
    const existingSkills = selectedSkills.filter((s) => s !== "__OTHERS__" && !customSkills.includes(s));
    const updatedSkills = [
      ...existingSkills,
      trimmedSkill, // Add the new custom skill
      ...(selectedSkills.includes("__OTHERS__") || newCustomSkills.length > 0 ? ["__OTHERS__"] : []),
    ];

    if (onSkillsChange) {
      onSkillsChange(updatedSkills);
    } else {
      onSkillToggle(trimmedSkill);
      // Ensure __OTHERS__ is selected if not already
      if (!selectedSkills.includes("__OTHERS__")) {
        onSkillToggle("__OTHERS__");
      }
    }

    // Clear input
    setCustomSkillInput("");
    onClearError("skills");
  };

  /**
   * Handle removing a custom skill
   */
  const handleRemoveCustomSkill = (skillToRemove: string) => {
    const newCustomSkills = customSkills.filter((s) => s !== skillToRemove);
    setCustomSkills(newCustomSkills);

    // Update selected skills
    const updatedSkills = [
      ...selectedSkills.filter((s) => s !== skillToRemove && s !== "__OTHERS__"),
      ...newCustomSkills,
      ...(newCustomSkills.length > 0 || isOthersSelected ? ["__OTHERS__"] : []),
    ];

    if (onSkillsChange) {
      onSkillsChange(updatedSkills);
    } else {
      onSkillToggle(skillToRemove);
    }

    // Hide input if no custom skills left
    if (newCustomSkills.length === 0) {
      setShowCustomSkillInput(false);
      setCustomSkillInput("");
    }
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
          // Only clear course if department actually changed (not during initial load)
          // Check if the new department is different from the current one
          if (course && typeof value === 'object' && value.value !== department?.value) {
            // Department changed, clear course
            onCourseChange(null);
          }
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
        // Ensure course is shown even if options haven't loaded yet
        // The value prop should handle this, but we can add a fallback
        key={`course-select-${course?.value || 'none'}-${nestedData.length}`}
      />
      <MultiSelect
        title="Skills Required *"
        options={skillOptions}
        value={selectedSkillOptions}
        onChange={handleSkillsChange}
        placeHolder="Select skills..."
        error={errors.skills}
      />

      {/* Custom Skills Input - shown when "Others" is selected */}
      {(showCustomSkillInput || isOthersSelected) && (
        <div className="space-y-2">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                title="Add Custom Skill"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                placeholder="Type a custom skill..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              onClick={handleAddCustomSkill}
              disabled={!customSkillInput.trim()}
              className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mb-[3px]"
            >
              <Plus size={16} />
              Add
            </Button>
          </div>

          {/* Display custom skills as chips */}
          {customSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {customSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 bg-pale-primary text-primary rounded-full px-3 py-1 text-sm"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomSkill(skill)}
                    className="hover:bg-primary rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProjectFormStep1;

