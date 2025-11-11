/**
 * Hook for project action handlers (navigation, exports)
 * Separated from useProjectDetails for better organization
 */
import { useRouter } from 'next/navigation'
import { ProjectI } from '@/src/models/project'
import { ApplicationI } from '@/src/models/application'
import { MilestoneI } from '@/src/models/milestone'

/**
 * Callback function type for showing success messages
 * Components should use toast notifications or similar
 */
export type ShowSuccessCallback = (message: string) => void

export interface UseProjectActionsOptions {
  openChatModal?: (applicationId?: number) => void;
  openApplicationDetailModal?: (applicationId: number) => void;
}

export const useProjectActions = (projectId: string, options?: UseProjectActionsOptions) => {
    const router = useRouter()

    /**
     * Open application detail modal instead of navigating
     */
    const handleViewProfile = (applicationId: number, studentId?: string) => {
        if (options?.openApplicationDetailModal) {
            // Open application detail modal
            options.openApplicationDetailModal(applicationId);
        } else if (studentId) {
            // Fallback to navigation if no modal handler
            router.push(`/student/profile?id=${studentId}`)
        } else {
            // Fallback to navigation if no modal handler
            router.push(`/partner/applications/${applicationId}`)
        }
    }

    /**
     * Open chat modal with application context
     */
    const handleMessage = (applicationId: number) => {
        if (options?.openChatModal) {
            options.openChatModal(applicationId);
        }
    }

    /**
     * Open chat modal instead of navigating to chat page
     */
    const handleOpenChat = () => {
        if (options?.openChatModal) {
            options.openChatModal();
        }
    }

    /**
     * Export project data as JSON
     */
    const handleExportDetails = (
        project: ProjectI | null,
        applications: ApplicationI[],
        milestones: MilestoneI[]
    ) => {
        const exportData = {
            project,
            applications,
            milestones,
            exportedAt: new Date().toISOString()
        }

        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `project-${projectId}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    /**
     * Share project link
     * Returns the URL and a success message - components should handle showing toast
     */
    const handleShareProject = async (): Promise<{ success: boolean; message: string }> => {
        const shareUrl = `${window.location.origin}/partner/projects/${projectId}`

        try {
            await navigator.clipboard.writeText(shareUrl)
            return { success: true, message: 'Project link copied to clipboard!' }
        } catch (_error) {
            try {
                const textarea = document.createElement('textarea')
                textarea.value = shareUrl
                document.body.appendChild(textarea)
                textarea.select()
                document.execCommand('copy')
                document.body.removeChild(textarea)
                return { success: true, message: 'Project link copied to clipboard!' }
            } catch (_err) {
                return { success: false, message: 'Failed to copy link. Please copy manually.' }
            }
        }
    }

    return {
        handleViewProfile,
        handleMessage,
        handleOpenChat,
        handleExportDetails,
        handleShareProject
    }
}

