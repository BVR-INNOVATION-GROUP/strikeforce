"use client"
import ProjectHeader from '@/src/components/screen/partner/projects/ProjectHeader'
import ProjectContent from '@/src/components/screen/partner/projects/ProjectContent'
import ProjectSidebar from '@/src/components/screen/partner/projects/ProjectSidebar'
import ProjectDetailModals from '@/src/components/screen/partner/projects/ProjectDetailModals'
import ProjectDetailSkeleton from '@/src/components/screen/partner/projects/ProjectDetailSkeleton'
import ChatModal from '@/src/components/base/ChatModal'
import { useAuthStore } from '@/src/store'
import { ProjectI as ModelProjectI } from '@/src/models/project'
import { useProjectDetailPage } from '@/src/hooks/useProjectDetailPage'
import { formatDateLong } from '@/src/utils/dateFormatters'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/src/hooks/useToast'
import RecommendModal from '@/src/components/screen/partner/projects/RecommendModal'
import ConfirmationDialog from '@/src/components/base/ConfirmationDialog'
import { UserI } from '@/src/models/user'

/**
 * Project Details Page - Upwork-style design with extra features
 * Displays comprehensive project information including:
 * - Project overview and description
 * - Skills and requirements
 * - Budget and timeline
 * - Applications/groups section
 * - Milestones section
 * - Team members
 * - Chat/Messages section
 */
export default function ProjectDetailsPage() {
    const params = useParams()
    const projectId = params?.id as string
    const { user, setUser } = useAuthStore()
    const router = useRouter()
    const [userLoading, setUserLoading] = useState(true)

    // Initialize user if not set (for demo purposes)
    useEffect(() => {
        const initializeUser = async () => {
            if (!user) {
                try {
                    // Load mock user data for partner role
                    const usersData = await import("@/src/data/mockUsers.json")
                    const users = usersData.default as UserI[]
                    const partnerUser = users.find((u) => u.role === "partner")

                    if (partnerUser) {
                        setUser(partnerUser)
                    } else {
                        // Redirect to home if no user found
                        router.push("/")
                    }
                } catch (error) {
                    console.error("Failed to load user data:", error)
                    router.push("/")
                }
            }
            setUserLoading(false)
        }

        initializeUser()
    }, [user, setUser, router])

    const {
        project,
        loading,
        currencySymbol,
        daysUntilDeadline,
        messages,
        chatMessages,
        chatUsers,
        chatThreadId,
        actions,
        mutations,
        modals,
        handlers,
        projectData,
        applications,
        milestones,
        setProjectData,
        setMilestones,
        handleAddMilestone,
        handleUpdateMilestone,
        handleSaveProject,
        handleApproveAndRelease,
        handleDisapprove,
        handleRequestChanges,
        handleMarkAsComplete,
        handleUnmarkAsComplete,
        handleAcceptApplication,
        handleRejectApplication,
        handleRecommendApplication,
        handleDeleteProject,
        handleReassignProject,
        handleSendChatMessage,
    } = useProjectDetailPage(projectId, user?.orgId, user?.id)

    // Determine if user is project owner (partner who created the project)
    // Check if current user's ID matches the project's partnerId
    const isProjectOwner = user?.role === 'partner' && user?.id === projectData?.partnerId

    // Handle edit milestone
    const handleEditMilestone = (milestoneId: string) => {
        modals.openEditMilestoneModal(milestoneId)
    }

    if (userLoading || loading || !project) {
        return <ProjectDetailSkeleton />
    }

    return (
        <div className="w-full flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0 mb-8">
                <ProjectHeader
                    title={project.title}
                    status={project.status}
                    createdAt={project.createdAt}
                    onBack={() => router.back()}
                    onOpenChat={actions.handleOpenChat}
                    formatDate={formatDateLong}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
                <ProjectContent
                    project={project}
                    applications={applications}
                    milestones={milestones}
                    currencySymbol={currencySymbol}
                    messages={messages}
                    attachments={projectData?.attachments}
                    formatDate={formatDateLong}
                    onViewProfile={actions.handleViewProfile}
                    onMessage={actions.handleMessage}
                    onReassign={(applicationId: number) => modals.openReassignProjectModal()}
                    onAccept={(applicationId: number) => modals.openAcceptConfirm(applicationId)}
                    onReject={(applicationId: number) => modals.openRejectConfirm(applicationId)}
                    onRecommend={(applicationId: number) => modals.openRecommendModal(applicationId)}
                    onOpenChat={actions.handleOpenChat}
                    onAddMilestone={modals.openMilestoneModal}
                    onEditMilestone={handleEditMilestone}
                    onApproveAndRelease={handleApproveAndRelease}
                    onDisapprove={handleDisapprove}
                    onRequestChanges={handleRequestChanges}
                    onMarkAsComplete={handleMarkAsComplete}
                    onUnmarkAsComplete={handleUnmarkAsComplete}
                    userRole={user?.role}
                    isProjectOwner={isProjectOwner}
                />

                <ProjectSidebar
                    project={project}
                    currencySymbol={currencySymbol}
                    daysUntilDeadline={daysUntilDeadline}
                    formatDate={formatDateLong}
                    onEditProject={modals.openEditModal}
                    onExportDetails={() => actions.handleExportDetails(projectData, applications, milestones)}
                    onShareProject={async () => {
                        const result = await actions.handleShareProject()
                        if (result.success) {
                            // Success handled by hook
                        } else {
                            // Error handled by hook
                        }
                    }}
                    onReassignProject={modals.openReassignProjectModal}
                    onDeleteProject={modals.openDeleteConfirm}
                />
            </div>

            {/* Modals */}
            <ProjectDetailModals
                isMilestoneModalOpen={modals.isMilestoneModalOpen}
                isEditMilestoneModalOpen={modals.isEditMilestoneModalOpen}
                selectedMilestoneId={modals.selectedMilestoneId}
                milestones={milestones}
                isEditModalOpen={modals.isEditModalOpen}
                showReassignConfirm={modals.showReassignConfirm}
                showDeleteConfirm={modals.showDeleteConfirm}
                showReassignProjectModal={modals.showReassignProjectModal}
                selectedApplicationId={modals.selectedApplicationId}
                isApplicationDetailModalOpen={modals.isApplicationDetailModalOpen}
                selectedApplicationDetailId={modals.selectedApplicationDetailId}
                projectData={projectData}
                applications={applications}
                applicationDisplay={project?.applications || []}
                onCloseMilestoneModal={modals.closeMilestoneModal}
                onCloseEditMilestoneModal={modals.closeEditMilestoneModal}
                onCloseEditModal={modals.closeEditModal}
                onCloseReassignConfirm={modals.closeReassignConfirm}
                onCloseDeleteConfirm={modals.closeDeleteConfirm}
                onCloseReassignProjectModal={modals.closeReassignProjectModal}
                onCloseApplicationDetailModal={modals.closeApplicationDetailModal}
                onCreateMilestone={handleAddMilestone}
                onUpdateMilestone={handleUpdateMilestone}
                onSaveProject={handleSaveProject}
                onConfirmReassign={async () => {
                    if (modals.selectedApplicationId) {
                        try {
                            const applicationId = parseInt(modals.selectedApplicationId, 10)
                            if (!isNaN(applicationId)) {
                                await mutations.handleReassignGroup(modals.selectedApplicationId, undefined)
                                modals.closeReassignConfirm()
                            }
                        } catch (error) {
                            // Error handled by hook
                        }
                    }
                }}
                onConfirmDelete={handleDeleteProject}
                onReassignProject={handleReassignProject}
                currentAssignedApplicationId={applications.find(a => a.status === "ASSIGNED")?.id || null}
            />

            {/* Chat Modal */}
            <ChatModal
                open={modals.isChatModalOpen}
                onClose={modals.closeChatModal}
                projectId={projectId}
                projectTitle={project?.title}
                applicationId={modals.selectedChatApplicationId}
                applicationName={modals.selectedChatApplicationId
                    ? project?.applications.find(app => app.id === modals.selectedChatApplicationId)?.groupName
                    : undefined}
                messages={chatMessages}
                users={chatUsers}
                currentUserId={user?.id}
                onSendMessage={handleSendChatMessage}
            />

            {/* Recommend Modal */}
            <RecommendModal
                open={modals.isRecommendModalOpen}
                onClose={modals.closeRecommendModal}
                onConfirm={async (partnerIds: string[]) => {
                    if (modals.selectedRecommendApplicationId) {
                        try {
                            await handleRecommendApplication(modals.selectedRecommendApplicationId, partnerIds);
                            modals.closeRecommendModal();
                        } catch (error) {
                            // Error handled by hook
                        }
                    }
                }}
                applicationGroupName={modals.selectedRecommendApplicationId
                    ? project?.applications.find(app => app.id === modals.selectedRecommendApplicationId)?.groupName
                    : undefined}
            />

            {/* Accept Confirmation */}
            <ConfirmationDialog
                open={modals.isAcceptConfirmOpen}
                onClose={modals.closeAcceptConfirm}
                onConfirm={async () => {
                    if (modals.selectedAcceptApplicationId) {
                        try {
                            await handleAcceptApplication(modals.selectedAcceptApplicationId);
                            modals.closeAcceptConfirm();
                        } catch (error) {
                            // Error handled by hook
                        }
                    }
                }}
                title="Accept Application"
                message={modals.selectedAcceptApplicationId
                    ? `Are you sure you want to accept ${project?.applications.find(app => app.id === modals.selectedAcceptApplicationId)?.groupName || 'this application'}?`
                    : 'Are you sure you want to accept this application?'}
                type="success"
                confirmText="Accept"
                cancelText="Cancel"
            />

            {/* Reject Confirmation */}
            <ConfirmationDialog
                open={modals.isRejectConfirmOpen}
                onClose={modals.closeRejectConfirm}
                onConfirm={async () => {
                    if (modals.selectedRejectApplicationId) {
                        try {
                            await handleRejectApplication(modals.selectedRejectApplicationId);
                            modals.closeRejectConfirm();
                        } catch (error) {
                            // Error handled by hook
                        }
                    }
                }}
                title="Reject Application"
                message={modals.selectedRejectApplicationId
                    ? `Are you sure you want to reject ${project?.applications.find(app => app.id === modals.selectedRejectApplicationId)?.groupName || 'this application'}? This action cannot be undone.`
                    : 'Are you sure you want to reject this application? This action cannot be undone.'}
                type="danger"
                confirmText="Reject"
                cancelText="Cancel"
            />

            {/* Toast notifications */}
        </div>
    )
}

