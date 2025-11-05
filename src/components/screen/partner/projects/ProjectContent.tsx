/**
 * ProjectContent - main content column with project details
 */
import React from 'react'
import Card from '@/src/components/core/Card'
import Badge from '@/src/components/core/Badge'
import Button from '@/src/components/core/Button'
import ApplicationCard from './ApplicationCard'
import MilestoneCard from './MilestoneCard'
import ChatSection from './ChatSection'
import AttachmentsCard from './AttachmentsCard'
import { ApplicationI } from '@/src/models/application'
import { getMilestonePermissions } from '@/src/utils/milestonePermissions'
import { MilestoneI } from '@/src/models/milestone'
import { UserRole } from '@/src/models/user'

export interface ProjectDisplayI {
    description: string
    skills: string[]
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
        progress?: number
        completedDate?: string
    }>
}

export interface Props {
    project: ProjectDisplayI
    applications: ApplicationI[]
    milestones: Array<{ id: string; escrowStatus?: string; supervisorGate?: boolean; status?: string }>
    currencySymbol: string
    messages: Array<{ id: string; sender: string; text: string; timestamp: string; avatar?: string }>
    attachments?: string[]
    formatDate: (dateString: string) => string
    onViewProfile: (applicationId: number) => void
    onMessage: (applicationId: number) => void
    onReassign: (applicationId: number) => void
    onAccept?: (applicationId: number) => void
    onReject?: (applicationId: number) => void
    onRecommend?: (applicationId: number) => void
    onOpenChat: () => void
    onAddMilestone: () => void
    onEditMilestone?: (milestoneId: string) => void // Callback for editing milestone
    onApproveAndRelease?: (milestoneId: string) => void
    onDisapprove?: (milestoneId: string) => void
    onRequestChanges?: (milestoneId: string) => void
    onMarkAsComplete?: (milestoneId: string) => void
    onUnmarkAsComplete?: (milestoneId: string) => void
    userRole?: string // User role for permission checks
    isProjectOwner?: boolean // Whether user owns the project
}

const ProjectContent = (props: Props) => {
    const {
        project,
        applications,
        milestones,
        currencySymbol,
        messages,
        attachments,
        formatDate,
        onViewProfile,
        onMessage,
        onReassign,
        onAccept,
        onReject,
        onRecommend,
        onOpenChat,
        onAddMilestone,
        onEditMilestone,
        onApproveAndRelease,
        onDisapprove,
        onRequestChanges,
        onMarkAsComplete,
        onUnmarkAsComplete,
        userRole,
        isProjectOwner = false
    } = props


    return (
        <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-y-auto pr-2">
            <Card title="Project Overview">
                <div className="prose max-w-none">
                    <p className="whitespace-pre-line text-[0.875rem] leading-relaxed opacity-60">{project.description}</p>
                </div>
            </Card>

            <Card title="Required Skills">
                <div className="flex flex-wrap gap-3">
                    {project.skills.map((skill, index) => (
                        <div key={index} className='rounded-full bg-very-pale px-4 py-2 text-[0.875rem]'>
                            {skill}
                        </div>
                    ))}
                </div>
            </Card>

            <Card
                title="Applications"
                actions={<Badge variant="default">{project.applications.length} applications</Badge>}
            >
                {project.applications.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[0.875rem] opacity-60 mb-2">No applications yet</p>
                        <p className="text-[0.8125rem] opacity-40">Applications will appear here when students apply to this project.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {project.applications.map((app) => {
                            const applicationData = applications.find(a => a.id === app.id)
                            // Check if there's already an assigned application
                            const hasAssignedApplication = applications.some(a =>
                                a.status === "ASSIGNED" && a.id !== app.id
                            )
                            return applicationData ? (
                                <ApplicationCard
                                    key={app.id}
                                    application={app}
                                    applicationData={applicationData}
                                    hasAssignedApplication={hasAssignedApplication}
                                    onViewProfile={onViewProfile}
                                    onMessage={onMessage}
                                    onReassign={onReassign}
                                    onAccept={onAccept}
                                    onReject={onReject}
                                    onRecommend={onRecommend}
                                    formatDate={formatDate}
                                />
                            ) : null
                        })}
                    </div>
                )}
            </Card>

            <Card
                title="Project Milestones"
                actions={
                    (userRole === 'partner' && isProjectOwner) || userRole === 'super-admin' ? (
                        <Button onClick={onAddMilestone} className="bg-primary text-[0.875rem]">Add Milestone</Button>
                    ) : undefined
                }
            >
                <div className="flex flex-col gap-6">
                    {project.milestones && project.milestones.length > 0 ? (
                        project.milestones.map((milestone) => {
                            // Find full milestone by matching IDs (handle both string and number types)
                            const fullMilestone = milestones.find(m => {
                                const mId = typeof m.id === 'number' ? m.id.toString() : m.id;
                                const milestoneId = typeof milestone.id === 'number' ? milestone.id.toString() : milestone.id.toString();
                                return mId === milestoneId;
                            }) as MilestoneI | undefined

                            // Get permissions for this milestone
                            const permissions = getMilestonePermissions(
                                userRole as UserRole | undefined,
                                fullMilestone,
                                isProjectOwner
                            )

                            return (
                                <MilestoneCard
                                    key={`${milestone.id}-${fullMilestone?.status || milestone.status}`}
                                    milestone={milestone}
                                    currencySymbol={currencySymbol}
                                    formatDate={formatDate}
                                    escrowStatus={fullMilestone?.escrowStatus}
                                    supervisorGate={fullMilestone?.supervisorGate}
                                    onEdit={onEditMilestone && permissions.canEdit ? () => onEditMilestone(String(milestone.id)) : undefined}
                                    canEdit={permissions.canEdit}
                                    onApproveAndRelease={onApproveAndRelease && permissions.canApproveAndRelease ? () => onApproveAndRelease(String(milestone.id)) : undefined}
                                    onDisapprove={onDisapprove && permissions.canDisapprove ? () => onDisapprove(String(milestone.id)) : undefined}
                                    onRequestChanges={onRequestChanges && permissions.canRequestChanges ? () => onRequestChanges(String(milestone.id)) : undefined}
                                    onMarkAsComplete={onMarkAsComplete && permissions.canMarkAsComplete ? () => onMarkAsComplete(String(milestone.id)) : undefined}
                                    onUnmarkAsComplete={onUnmarkAsComplete && permissions.canUnmarkAsComplete ? () => onUnmarkAsComplete(String(milestone.id)) : undefined}
                                    canDisapprove={permissions.canDisapprove}
                                    canMarkAsComplete={permissions.canMarkAsComplete}
                                    canUnmarkAsComplete={permissions.canUnmarkAsComplete}
                                    actualStatus={fullMilestone?.status}
                                />
                            )
                        })
                    ) : (
                        <p className="text-sm text-gray-500">No milestones yet. Click "Add Milestone" to create one.</p>
                    )}
                </div>
            </Card>

            {attachments && attachments.length > 0 && (
                <AttachmentsCard attachments={attachments} />
            )}

            <Card title="Project Chat">
                <ChatSection messages={messages} onOpenFullChat={onOpenChat} />
            </Card>
        </div>
    )
}

export default ProjectContent

