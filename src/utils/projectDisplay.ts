/**
 * Project display data transformation utilities
 */
import { ProjectI } from '@/src/models/project'
import { ApplicationI } from '@/src/models/application'
import { MilestoneI } from '@/src/models/milestone'
import { transformApplications, transformMilestones, transformTeamMembers } from './projectTransformers'
import { formatDateShort } from './dateFormatters'
import { getMockProjectDisplayData } from './mockProjectData'

export interface ProjectDisplayI {
    id: number
    title: string
    description: string
    skills: string[]
    status: string
    budget: number
    currency: string
    deadline: string
    capacity: number
    university: string
    department: string
    course: string
    createdAt: string
    attachments?: string[]
    applications: Array<{
        id: number
        groupName: string
        members: Array<{ name: string; avatar: string }>
        status: string
        portfolioScore: number
        appliedAt: string
    }>
    milestones: Array<{
        id: number
        title: string
        status: string
        dueDate: string
        amount: number
        currency?: string
        progress?: number
        completedDate?: string
    }>
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

/**
 * Transforms project data to display format
 * @param sourceProject - Source project data or null
 * @param applications - Array of application objects
 * @param milestones - Array of milestone objects
 * @param projectId - Project ID for mock data fallback
 * @param groups - Optional groups data for application transformation
 * @param users - Optional users data for application transformation
 * @param supervisorId - Optional supervisor ID for badge display
 * @param currentUserId - Optional current user ID for badge display
 * @returns Transformed project display data
 */
export const transformProjectForDisplay = async (
    sourceProject: ProjectI | null,
    applications: ApplicationI[],
    milestones: MilestoneI[],
    projectId: string,
    groups?: unknown[],
    users?: unknown[],
    supervisorId?: string,
    currentUserId?: string
): Promise<ProjectDisplayI> => {
    if (sourceProject) {
        const formattedDeadline = formatDateShort(sourceProject.deadline)

        // Load groups and users if not provided
        let groupsData = groups
        let usersData = users
        
        if (!groupsData || !usersData) {
            const [groupsModule, usersModule] = await Promise.all([
                import("@/src/data/mockGroups.json"),
                import("@/src/data/mockUsers.json")
            ])
            groupsData = groupsData || groupsModule.default
            usersData = usersData || usersModule.default
        }

        const mappedApplications = transformApplications(applications, groupsData, usersData)
        const mappedMilestones = transformMilestones(milestones, sourceProject.currency)
        const teamMembers = transformTeamMembers(
            applications, 
            usersData, 
            groupsData, 
            supervisorId || sourceProject.supervisorId,
            currentUserId
        )

        return {
            id: sourceProject.id,
            title: sourceProject.title,
            description: sourceProject.description,
            skills: sourceProject.skills,
            status: sourceProject.status,
            budget: sourceProject.budget,
            currency: sourceProject.currency,
            deadline: formattedDeadline,
            capacity: sourceProject.capacity,
            university: "Makerere University", // Would come from university lookup
            department: "Computer Science", // Would come from department lookup
            course: "Software Engineering (Year 3)", // Would come from course lookup
            createdAt: sourceProject.createdAt,
            attachments: sourceProject.attachments,
            applications: mappedApplications,
            milestones: mappedMilestones,
            teamMembers
        }
    }

    return getMockProjectDisplayData(projectId)
}

