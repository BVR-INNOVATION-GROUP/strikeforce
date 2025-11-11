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
     * Partner action: Accept application - sets status to ACCEPTED
     */
    const handleAcceptApplication = async (applicationId: number): Promise<void> => {
        try {
            const { applicationRepository } = await import('@/src/repositories/applicationRepository');
            // Update application status to ACCEPTED
            await applicationRepository.update(applicationId, {
                status: "ACCEPTED",
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Failed to accept application:", error)
            throw new Error("Failed to accept application. Please try again.")
        }
    }

    /**
     * Reject an application
     * Partner action: Reject application - sets status to REJECTED
     */
    const handleRejectApplication = async (applicationId: number, reason?: string): Promise<void> => {
        try {
            const { applicationRepository } = await import('@/src/repositories/applicationRepository');
            // Update application status to REJECTED
            await applicationRepository.update(applicationId, {
                status: "REJECTED",
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Failed to reject application:", error)
            throw new Error("Failed to reject application. Please try again.")
        }
    }

    /**
     * Recommend an application to other partners
     * Partner action: Recommend to selected partners
     * Note: This doesn't change application status, just notifies partners
     */
    const handleRecommendApplication = async (applicationId: number, partnerIds?: string[]): Promise<void> => {
        try {
            // Recommendation is a notification action, not a status change
            // In the future, this could create notifications or update a recommendations table
            // For now, we just log it - the modal handles the partner selection
            if (partnerIds && partnerIds.length > 0) {
                console.log('Recommending application:', applicationId, 'to partners:', partnerIds);
                // TODO: Create notifications for recommended partners
                // This would typically:
                // - Create notification records for each partner
                // - Send emails/notifications to partners
                // - Possibly update application metadata with recommended partner IDs
            }
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
            // Convert projectId to number if it's a string
            const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
            
            await milestoneRepository.create({
                projectId: numericProjectId,
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
     * Delete milestone
     * Note: Validation should be done in the service layer
     */
    const handleDeleteMilestone = async (milestoneId: string): Promise<void> => {
        try {
            const { milestoneService } = await import('@/src/services/milestoneService');
            await milestoneService.deleteMilestone(milestoneId);
        } catch (error) {
            console.error("Failed to delete milestone:", error)
            throw new Error(error instanceof Error ? error.message : "Failed to delete milestone. Please try again.")
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
            const { applicationRepository } = await import('@/src/repositories/applicationRepository');
            const { applicationService } = await import('@/src/services/applicationService');
            
            // Get all applications for this project
            const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
            const allApplications = await applicationService.getProjectApplications(numericProjectId);
            
            // Find currently assigned application
            const currentlyAssigned = allApplications.find(app => app.status === "ASSIGNED");
            
            // Update old application status from ASSIGNED to ACCEPTED (if exists)
            if (currentlyAssigned && currentlyAssigned.id !== applicationId) {
                await applicationRepository.update(currentlyAssigned.id, {
                    status: "ACCEPTED",
                    updatedAt: new Date().toISOString(),
                });
            }
            
            // Set the new application status to ASSIGNED
            await applicationRepository.update(applicationId, {
                status: "ASSIGNED",
                updatedAt: new Date().toISOString(),
            });
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
        handleDeleteMilestone,
        handleSaveProject,
        handleDeleteProject,
        handleReassignProject
    }
}

