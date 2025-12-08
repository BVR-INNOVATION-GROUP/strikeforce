/**
 * EditProjectModal - modal for editing project details
 * Uses the full ProjectForm component with pre-filled values
 */
import React, { useMemo } from 'react'
import { ProjectI } from '@/src/models/project'
import ProjectForm from './ProjectForm'
import { currenciesArray } from '@/src/constants/currencies'
import { topUgandanUniversities } from '@/src/constants/universities'
import { OptionI } from '@/src/components/core/Select'

export interface Props {
    open: boolean
    project: ProjectI | null
    onClose: () => void
    onSave: (data: Partial<ProjectI>) => Promise<void>
    isSaving?: boolean
}

/**
 * Transform ProjectI to ProjectForm initial data format
 * Handles both string and number ID formats for matching
 * Also handles nested department.organization structure from raw API data
 */
const transformProjectToFormData = (project: ProjectI | null) => {
    if (!project) return undefined

    // Check if we have raw project data with nested structure
    const rawProject = project as any;
    let universityOption: OptionI | undefined = undefined;
    let departmentOption: OptionI | null = null;
    let courseOption: OptionI | null = null;

    // First, try to extract from nested structure (raw API data)
    if (rawProject.department) {
        const dept = rawProject.department;
        const org = dept.organization || dept.Organization;

        // Extract department
        if (dept.name || dept.Name) {
            const deptId = dept.ID || dept.id || project.departmentId;
            departmentOption = {
                value: String(deptId),
                label: dept.name || dept.Name
            };
        }

        // Extract university from nested organization
        if (org && (org.name || org.Name)) {
            const orgId = org.ID || org.id || project.universityId;
            universityOption = {
                value: String(orgId),
                label: org.name || org.Name
            };
        }
    }

    // Extract course from nested course object
    if (rawProject.course) {
        const courseObj = rawProject.course;
        if (courseObj.name || courseObj.Name) {
            const courseId = courseObj.ID || courseObj.id || project.courseId;
            courseOption = {
                value: String(courseId),
                label: courseObj.name || courseObj.Name
            };
        }
    } else if (rawProject.Course) {
        const courseObj = rawProject.Course;
        if (courseObj.name || courseObj.Name) {
            const courseId = courseObj.ID || courseObj.id || project.courseId;
            courseOption = {
                value: String(courseId),
                label: courseObj.name || courseObj.Name
            };
        }
    }

    // Fallback: If we don't have nested structure, try to find from constants using IDs
    if (!universityOption && project.universityId) {
        const projectUniversityId = String(project.universityId);
        const university = topUgandanUniversities.find(u =>
            String(u.id) === projectUniversityId
        );
        if (university) {
            universityOption = {
                value: String(university.id),
                label: university.name
            };
        }
    }

    // Fallback: Find department and course from constants if not already set
    if (!departmentOption && project.departmentId && universityOption) {
        const projectDepartmentId = String(project.departmentId);
        const university = topUgandanUniversities.find(u =>
            String(u.id) === universityOption?.value
        );
        if (university) {
            const department = university.departments.find(d =>
                String(d.id) === projectDepartmentId
            );
            if (department) {
                departmentOption = {
                    value: String(department.id),
                    label: department.name
                };

                // Find course
                if (project.courseId) {
                    const projectCourseId = String(project.courseId);
                    const course = department.courses.find(c =>
                        String(c.id) === projectCourseId
                    );
                    if (course) {
                        courseOption = {
                            value: String(course.id),
                            label: `${course.name} (Year ${course.year})`
                        };
                    }
                }
            }
        }
    }

    // Find currency
    const currency = currenciesArray.find(c => c.code === project.currency)
    const currencyOption: OptionI | null = currency ? {
        value: currency.code,
        label: `${currency.code} - ${currency.name}`,
        icon: currency.icon
    } : null

    // Format deadline for date input (YYYY-MM-DD)
    const deadlineDate = project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''

    // Handle budget - extract value if it's an object
    let budgetValue = project.budget;
    if (typeof budgetValue === 'object' && budgetValue !== null && !Array.isArray(budgetValue)) {
        const budgetObj = budgetValue as any;
        budgetValue = budgetObj.Value !== undefined ? budgetObj.Value : (budgetObj.value !== undefined ? budgetObj.value : 0);
    }

    return {
        university: universityOption,
        department: departmentOption,
        course: courseOption,
        currency: currencyOption,
        title: project.title || '',
        desc: project.description || '',
        summary: project.summary || '',
        challengeStatement: project.challengeStatement || '',
        scopeActivities: project.scopeActivities || '',
        deliverablesMilestones: project.deliverablesMilestones || '',
        teamStructure: project.teamStructure || '',
        duration: project.duration || '',
        expectations: project.expectations || '',
        budget: String(budgetValue),
        deadline: deadlineDate,
        capacity: project.capacity.toString(),
        selectedSkills: project.skills || []
    }
}

const EditProjectModal = (props: Props) => {
    const { open, project, onClose, onSave } = props

    const initialData = useMemo(() => transformProjectToFormData(project), [project])

    const handleSubmit = async (formData: Omit<ProjectI, 'id' | 'createdAt' | 'updatedAt' | 'partnerId'>) => {
        if (!project) return

        // The form data is already in the correct format from buildProjectFromForm
        // Extract all fields including structured fields
        const updateData: Partial<ProjectI> = {
            title: formData.title,
            description: formData.description,
            summary: formData.summary,
            challengeStatement: formData.challengeStatement,
            scopeActivities: formData.scopeActivities,
            deliverablesMilestones: formData.deliverablesMilestones,
            teamStructure: formData.teamStructure,
            duration: formData.duration,
            expectations: formData.expectations,
            budget: formData.budget,
            deadline: formData.deadline,
            capacity: formData.capacity,
            skills: formData.skills,
            universityId: formData.universityId,
            departmentId: formData.departmentId,
            currency: formData.currency
        }

        // Only include courseId if it's a valid number > 0
        if (formData.courseId && formData.courseId > 0) {
            updateData.courseId = formData.courseId;
        } else {
            // Explicitly set to 0 to clear the course (backend will convert to nil)
            updateData.courseId = 0;
        }

        await onSave(updateData)
    }

    // Always render ProjectForm - it will handle the open state
    // If project is null, initialData will be undefined and form will be empty
    return (
        <ProjectForm
            open={open}
            setOpen={onClose}
            initialData={initialData}
            onSubmit={handleSubmit}
            isSaving={props.isSaving}
        />
    )
}

export default EditProjectModal

