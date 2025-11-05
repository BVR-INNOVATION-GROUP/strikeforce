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
    onReassignProject: () => void
    onDeleteProject: () => void
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
        onDeleteProject
    } = props

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
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
            <QuickActionsCard
                onEditProject={onEditProject}
                onExportDetails={onExportDetails}
                onShareProject={onShareProject}
                onReassignProject={onReassignProject}
                onDeleteProject={onDeleteProject}
            />
        </div>
    )
}

export default ProjectSidebar

