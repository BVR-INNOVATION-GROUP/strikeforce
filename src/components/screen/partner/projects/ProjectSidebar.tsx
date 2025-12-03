/**
 * ProjectSidebar - displays project details sidebar
 * Composes multiple card components
 */
import React from 'react'
import ProjectDetailsCard from './ProjectDetailsCard'
import UniversityInfoCard from './UniversityInfoCard'
import TeamMembersCard from './TeamMembersCard'
import QuickActionsCard from './QuickActionsCard'

export interface ProjectDisplayI {
    budget: number
    currency: string
    deadline: string
    capacity: number
    university: string
    department: string
    course: string
    teamMembers: Array<{
        id: string
        name: string
        role: string
        avatar: string
        badges: {
            isLeader: boolean
            isSupervisor: boolean
            isYou: boolean
        }
    }>
}

export interface Props {
    project: ProjectDisplayI
    currencySymbol: string
    daysUntilDeadline: number
    formatDate: (dateString: string) => string
    onEditProject: () => void
    onExportDetails: () => void
    onShareProject: () => void
    onReassignProject?: () => void
    onDeleteProject: () => void
    onRequestSupervisor?: () => void
    userRole?: string
    isProjectOwner?: boolean
    canEditProject?: boolean
    canSeeQuickActions?: boolean
}

const ProjectSidebar = (props: Props) => {
    const {
        project,
        currencySymbol,
        daysUntilDeadline,
        formatDate,
        onEditProject,
        onExportDetails,
        onShareProject,
        onReassignProject,
        onDeleteProject,
        onRequestSupervisor,
        canEditProject = false,
        canSeeQuickActions = false
    } = props

    return (
        <div className="flex flex-col gap-6">
            <ProjectDetailsCard
                budget={project.budget}
                currencySymbol={currencySymbol}
                deadline={project.deadline}
                capacity={project.capacity}
                daysUntilDeadline={daysUntilDeadline}
                formatDate={formatDate}
            />
            <UniversityInfoCard
                university={project.university}
                department={project.department}
                course={project.course}
            />
            <TeamMembersCard teamMembers={project.teamMembers} />
            {/* Show Quick Actions for project owners (partners) and super-admins */}
            {canSeeQuickActions && (
                <QuickActionsCard
                    onEditProject={canEditProject ? (onEditProject || (() => { })) : undefined}
                    onExportDetails={onExportDetails}
                    onShareProject={onShareProject}
                    onReassignProject={onReassignProject}
                    onDeleteProject={canEditProject ? (onDeleteProject || (() => { })) : undefined}
                    onRequestSupervisor={onRequestSupervisor}
                />
            )}
        </div>
    )
}

export default ProjectSidebar

