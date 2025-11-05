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
}

/**
 * Transform ProjectI to ProjectForm initial data format
 * Handles both string and number ID formats for matching
 */
const transformProjectToFormData = (project: ProjectI | null) => {
    if (!project) return undefined

    // Normalize IDs for comparison - convert both to strings for consistent matching
    const projectUniversityId = String(project.universityId)
    const projectDepartmentId = String(project.departmentId)
    const projectCourseId = String(project.courseId)

    // Find university - compare both as strings
    const university = topUgandanUniversities.find(u => 
        String(u.id) === projectUniversityId
    )
    const universityOption: OptionI | undefined = university ? {
        value: String(university.id),
        label: university.name
    } : undefined

    // Find department and course
    let departmentOption: OptionI | null = null
    let courseOption: OptionI | null = null
    
    if (university) {
        const department = university.departments.find(d => 
            String(d.id) === projectDepartmentId
        )
        if (department) {
            departmentOption = {
                value: String(department.id),
                label: department.name
            }
            
            const course = department.courses.find(c => 
                String(c.id) === projectCourseId
            )
            if (course) {
                courseOption = {
                    value: String(course.id),
                    label: `${course.name} (Year ${course.year})`
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

    return {
        university: universityOption,
        department: departmentOption,
        course: courseOption,
        currency: currencyOption,
        title: project.title,
        desc: project.description,
        budget: project.budget.toString(),
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
        // Just extract the fields we want to update
        const updateData: Partial<ProjectI> = {
            title: formData.title,
            description: formData.description,
            budget: formData.budget,
            deadline: formData.deadline,
            capacity: formData.capacity,
            skills: formData.skills,
            universityId: formData.universityId,
            departmentId: formData.departmentId,
            courseId: formData.courseId,
            currency: formData.currency
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
        />
    )
}

export default EditProjectModal

