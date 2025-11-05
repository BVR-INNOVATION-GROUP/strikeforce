/**
 * Hook for project mutation operations (create, update)
 * Separated from useProjectDetails for better organization
 */
import { useRouter } from 'next/navigation'
import { ProjectI } from '@/src/models/project'
import { projectService } from '@/src/services/projectService'
import { milestoneRepository } from '@/src/repositories/milestoneRepository'
import { useProjectStore } from '@/src/store/useProjectStore'

export const useProjectMutations = (projectId: string) => {
    const router = useRouter()
    const { updateProject } = useProjectStore()

  /**
   * Reassign group for an application
   * Note: This function should be called after user confirms in a ConfirmationDialog
   * The confirmation dialog should be handled by the calling component
   */
  const handleReassignGroup = async (applicationId: string, newGroupId?: string): Promise<void> => {
    try {
      // Group reassignment functionality will be implemented with group selection modal
      // For now, this is a placeholder that updates client-side state
      console.log('Reassigning group for application:', applicationId, 'to group:', newGroupId)
      // TODO: Implement actual reassignment logic - update application with new groupId
      // This would typically update application status and notify the group
    } catch (error) {
      console.error("Failed to reassign group:", error)
      throw new Error("Failed to reassign group. Please try again.")
    }
  }

    /**
     * Accept an application (Partner can recommend, University Admin/Supervisor issues offers)
     * Partner action: Recommend for acceptance
     */
    const handleAcceptApplication = async (applicationId: number): Promise<void> => {
        try {
            console.log('Accepting application:', applicationId)
            // TODO: Implement actual acceptance logic
            // This would typically update application status to ACCEPTED
            // and notify University Admin/Supervisor for final offer issuance
        } catch (error) {
            console.error("Failed to accept application:", error)
            throw new Error("Failed to accept application. Please try again.")
        }
    }

    /**
     * Reject an application
     * Partner action: Reject application
     */
    const handleRejectApplication = async (applicationId: number, reason?: string): Promise<void> => {
        try {
            console.log('Rejecting application:', applicationId, 'reason:', reason)
            // TODO: Implement actual rejection logic
            // This would typically update application status to REJECTED
        } catch (error) {
            console.error("Failed to reject application:", error)
            throw new Error("Failed to reject application. Please try again.")
        }
    }

    /**
     * Recommend an application to other partners
     * Partner action: Recommend to selected partners
     */
    const handleRecommendApplication = async (applicationId: number, partnerIds?: string[]): Promise<void> => {
        try {
            console.log('Recommending application:', applicationId, 'to partners:', partnerIds)
            // TODO: Implement actual recommendation logic
            // This would typically notify selected partners about the application
            // and possibly update application score/status for consideration
        } catch (error) {
            console.error("Failed to recommend application:", error)
            throw new Error("Failed to recommend application. Please try again.")
        }
    }

    /**
     * Create new milestone
     * Note: Validation should be done in the form component
     */
    const handleAddMilestone = async (
        title: string,
        scope: string,
        dueDate: string,
        amount: string,
        onSuccess: () => void,
        currency?: string
    ): Promise<void> => {
        try {
            await milestoneRepository.create({
                projectId: projectId,
                title,
                scope: scope || "No scope defined",
                acceptanceCriteria: "To be defined",
                dueDate: new Date(dueDate).toISOString(),
                amount: parseFloat(amount) || 0,
                currency: currency, // Store currency with milestone
                escrowStatus: "PENDING",
                supervisorGate: false,
                status: "PROPOSED"
            })

            onSuccess()
        } catch (error) {
            console.error("Failed to create milestone:", error)
            throw new Error("Failed to create milestone. Please try again.")
        }
    }

    /**
     * Update existing milestone
     * Note: Validation should be done in the form component
     */
    const handleUpdateMilestone = async (
        milestoneId: string,
        title: string,
        scope: string,
        dueDate: string,
        amount: string,
        currency?: string
    ): Promise<void> => {
        try {
            await milestoneRepository.update(milestoneId, {
                title,
                scope: scope || "No scope defined",
                dueDate: new Date(dueDate).toISOString(),
                amount: parseFloat(amount) || 0,
                currency: currency, // Update currency if provided
                updatedAt: new Date().toISOString()
            })
        } catch (error) {
            console.error("Failed to update milestone:", error)
            throw new Error("Failed to update milestone. Please try again.")
        }
    }

    /**
     * Save project updates
     */
    const handleSaveProject = async (updatedData: Partial<ProjectI>): Promise<ProjectI> => {
        if (!projectId) {
            throw new Error("Project ID is required")
        }

        try {
            const updated = await projectService.updateProject(projectId, updatedData)
            updateProject(projectId, updated)
            return updated
        } catch (error) {
            console.error("Failed to update project:", error)
            throw new Error("Failed to update project. Please try again.")
        }
    }

    /**
     * Delete project
     */
    const handleDeleteProject = async (): Promise<void> => {
        if (!projectId) {
            throw new Error("Project ID is required")
        }

        try {
            await projectService.deleteProject(projectId)
            // Navigate back to projects list after deletion
            router.push('/partner/projects')
        } catch (error) {
            console.error("Failed to delete project:", error)
            throw new Error("Failed to delete project. Please try again.")
        }
    }

    /**
     * Reassign project to a different group/application
     * Unassigns the current group and assigns the new one
     */
    const handleReassignProject = async (applicationId: number): Promise<void> => {
        if (!projectId) {
            throw new Error("Project ID is required")
        }

        try {
            // TODO: Implement actual reassignment logic
            // 1. Find currently assigned application and set status to ACCEPTED or SHORTLISTED
            // 2. Set the new application status to ASSIGNED
            // 3. Update project to reflect the new assignment
            console.log('Reassigning project to application:', applicationId)
            // This would typically:
            // - Update old application status from ASSIGNED to ACCEPTED
            // - Update new application status to ASSIGNED
            // - Notify both groups of the change
        } catch (error) {
            console.error("Failed to reassign project:", error)
            throw new Error("Failed to reassign project. Please try again.")
        }
    }

    return {
        handleReassignGroup,
        handleAcceptApplication,
        handleRejectApplication,
        handleRecommendApplication,
        handleAddMilestone,
        handleUpdateMilestone,
        handleSaveProject,
        handleDeleteProject,
        handleReassignProject
    }
}

