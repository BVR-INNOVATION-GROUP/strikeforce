/**
 * ProjectContent - main content column with project details
 */
import React, { useState } from 'react'
import Card from '@/src/components/core/Card'
import Badge from '@/src/components/core/Badge'
import Button from '@/src/components/core/Button'
import Checkbox from '@/src/components/core/Checkbox'
import ApplicationCard from './ApplicationCard'
import MilestoneCard from './MilestoneCard'
import ChatSection from './ChatSection'
import AttachmentsCard from './AttachmentsCard'
import ScreeningApplicationCard from '@/src/components/screen/university-admin/screening/ScreeningApplicationCard'
import { ApplicationI } from '@/src/models/application'
import { ProjectI } from '@/src/models/project'
import { getMilestonePermissions } from '@/src/utils/milestonePermissions'
import { MilestoneI } from '@/src/models/milestone'
import { UserRole } from '@/src/models/user'
import { stripHtmlTags, safeRender } from '@/src/utils/htmlUtils'
import { UserCheck, Clock, Users } from 'lucide-react'

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
    onWithdraw?: (applicationId: number) => void
    onTerminate?: (applicationId: number) => void
    onOpenChat: () => void
    onAddMilestone: () => void
    onEditMilestone?: (milestoneId: string) => void // Callback for editing milestone
    onDeleteMilestone?: (milestoneId: string) => void // Callback for deleting milestone
    onApproveAndRelease?: (milestoneId: string) => void
    onDisapprove?: (milestoneId: string) => void
    onRequestChanges?: (milestoneId: string) => void
    onMarkAsComplete?: (milestoneId: string) => void
    onUnmarkAsComplete?: (milestoneId: string) => void
    userRole?: string // User role for permission checks
    isProjectOwner?: boolean // Whether user owns the project
    canEditProject?: boolean // Whether user can edit the project (super-admin only)
    currentUserId?: string | number // Current user ID
    // University admin screening props
    projectData?: ProjectI // Full project data for screening
    onScore?: (application: ApplicationI) => void
    onViewScreeningDetails?: (application: ApplicationI) => void
    onShortlist?: (application: ApplicationI) => void
    onRejectScreening?: (application: ApplicationI) => void
    onOffer?: (application: ApplicationI) => void
    onUndoReject?: (application: ApplicationI) => void
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
        onWithdraw,
        onTerminate,
        onOpenChat,
        onAddMilestone,
        onEditMilestone,
        onDeleteMilestone,
        onApproveAndRelease,
        onDisapprove,
        onRequestChanges,
        onMarkAsComplete,
        onUnmarkAsComplete,
        userRole,
        isProjectOwner = false,
        canEditProject = false,
        currentUserId,
        projectData,
        onScore,
        onViewScreeningDetails,
        onShortlist,
        onRejectScreening,
        onOffer,
        onUndoReject,
    } = props

    // State for milestone selection
    const [selectedMilestoneIds, setSelectedMilestoneIds] = useState<Set<string>>(new Set())

    // State for screening bucket selection (university admin)
    const [selectedBucket, setSelectedBucket] = useState<string>("all")

    const toggleMilestoneSelection = (milestoneId: string, selected: boolean) => {
        setSelectedMilestoneIds(prev => {
            const next = new Set(prev)
            if (selected) {
                next.add(milestoneId)
            } else {
                next.delete(milestoneId)
            }
            return next
        })
    }

    const selectAllMilestones = () => {
        if (project.milestones && project.milestones.length > 0) {
            const allIds = new Set(project.milestones.map(m => String(m.id)))
            setSelectedMilestoneIds(allIds)
        }
    }

    const clearMilestoneSelection = () => {
        setSelectedMilestoneIds(new Set())
    }

    const handleBulkMarkComplete = async () => {
        if (onMarkAsComplete && selectedMilestoneIds.size > 0) {
            // Mark all selected milestones as complete sequentially to ensure proper sync
            const milestoneIdsArray = Array.from(selectedMilestoneIds);
            try {
                for (const id of milestoneIdsArray) {
                    await onMarkAsComplete(id);
                }
                clearMilestoneSelection();
            } catch (error) {
                // Error handling is done in individual onMarkAsComplete calls
                console.error("Error in bulk mark complete:", error);
            }
        }
    }

    const canBulkMarkComplete = (isProjectOwner || userRole === "super-admin") && onMarkAsComplete && selectedMilestoneIds.size > 0


    return (
        <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-y-auto pr-2">
            <Card title="Project Overview">
                <div className="prose max-w-none">
                    <p className="whitespace-pre-line text-[0.875rem] leading-relaxed opacity-60">{stripHtmlTags(safeRender(project.description))}</p>
                </div>
            </Card>

            <Card title="Required Skills">
                <div className="flex flex-wrap gap-3">
                    {project.skills?.map((skill, index) => (
                        <div key={index} className='rounded-full bg-very-pale px-4 py-2 text-[0.875rem]'>
                            {safeRender(skill)}
                        </div>
                    ))}
                </div>
            </Card>

            <Card
                title={userRole === "university-admin" || userRole === "partner" ? "Screening & Shortlisting" : "Applications"}
                actions={<Badge variant="default">{project.applications.length} applications</Badge>}
            >
                {userRole === "university-admin" || userRole === "partner" ? (
                    // University Admin/Partner Screening Interface
                    (() => {
                        const isReadOnly = userRole === "partner";
                        const buckets = {
                            all: applications.length,
                            SUBMITTED: applications.filter((a) => a.status === "SUBMITTED").length,
                            SHORTLISTED: applications.filter((a) => a.status === "SHORTLISTED").length,
                            ASSIGNED: applications.filter((a) => a.status === "ASSIGNED").length,
                            REJECTED: applications.filter((a) => a.status === "REJECTED").length,
                        };

                        const filteredApplications =
                            selectedBucket === "all"
                                ? applications
                                : applications.filter((app) => app.status === selectedBucket);

                        return (
                            <>
                                {/* Bucket Tabs */}
                                <div className="flex gap-4 border-b border-custom mb-6 overflow-x-auto">
                                    {Object.entries(buckets).map(([bucket, count]) => (
                                        <button
                                            key={bucket}
                                            onClick={() => setSelectedBucket(bucket)}
                                            className={`pb-2 px-4 whitespace-nowrap ${selectedBucket === bucket
                                                    ? "border-b-2 border-primary text-primary font-[600]"
                                                    : "text-[0.875rem] opacity-60"
                                                }`}
                                        >
                                            {bucket.charAt(0).toUpperCase() + bucket.slice(1)} ({count})
                                        </button>
                                    ))}
                                </div>

                                {/* Applications Grid */}
                                {filteredApplications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-[0.875rem] opacity-60">
                                            {applications.length === 0
                                                ? "No applications yet. Applications will appear here when students apply to this project."
                                                : `No applications in ${selectedBucket === "all" ? "this project" : `the ${selectedBucket.toLowerCase()} bucket`}`}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredApplications.map((application) => (
                                            <ScreeningApplicationCard
                                                key={application.id}
                                                application={application}
                                                project={projectData}
                                                onScore={onScore}
                                                onViewDetails={onViewScreeningDetails}
                                                onShortlist={onShortlist}
                                                onReject={onRejectScreening}
                                                onOffer={onOffer}
                                                onUndoReject={onUndoReject}
                                                readOnly={isReadOnly}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        );
                    })()
                ) : (
                    // Regular Applications Interface (Partners, Students, etc.)
                    project.applications.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-[0.875rem] opacity-60 mb-2">No applications yet</p>
                            <p className="text-[0.8125rem] opacity-40">Applications will appear here when students apply to this project.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Approval & Group Selection Statistics */}
                            {(() => {
                                const assignedApplication = applications.find((app) => app.status === "ASSIGNED");
                                const pendingApplications = applications.filter(
                                    (app) => app.status === "SUBMITTED" || app.status === "SHORTLISTED" || app.status === "WAITLIST"
                                ).length;
                                const totalApplications = applications.length;

                                return (
                                    <div className="grid grid-cols-3 gap-4 p-4 bg-pale rounded-lg border border-custom">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <UserCheck size={16} className={assignedApplication ? "text-green-600" : "text-secondary opacity-40"} />
                                                <p className="text-[0.8125rem] opacity-60">Groups Assigned</p>
                                            </div>
                                            <p className="text-xl font-bold">{assignedApplication ? "1" : "0"}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <Clock size={16} className={pendingApplications > 0 ? "text-amber-600" : "text-secondary opacity-40"} />
                                                <p className="text-[0.8125rem] opacity-60">Pending Review</p>
                                            </div>
                                            <p className="text-xl font-bold">{pendingApplications}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <Users size={16} className="text-primary" />
                                                <p className="text-[0.8125rem] opacity-60">Total Applications</p>
                                            </div>
                                            <p className="text-xl font-bold">{totalApplications}</p>
                                        </div>
                                    </div>
                                );
                            })()}
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
                                        onWithdraw={onWithdraw}
                                        onTerminate={onTerminate}
                                        formatDate={formatDate}
                                        // currentUserId={currentUserId}
                                        userRole={userRole}
                                    />
                                ) : null
                            })}
                        </div>
                    )
                )}
            </Card>

            <Card
                title="Project Milestones"
                actions={
                    onAddMilestone ? (
                        <Button onClick={onAddMilestone} className="bg-primary text-[0.875rem]">Add Milestone</Button>
                    ) : undefined
                }
            >
                {/* Bulk action bar */}
                {canBulkMarkComplete && (
                    <div className="mb-4 p-3 bg-very-pale rounded-lg border border-custom flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary">
                            {selectedMilestoneIds.size} milestone{selectedMilestoneIds.size !== 1 ? 's' : ''} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleBulkMarkComplete}
                                className="bg-primary text-white text-[0.8125rem] px-4 py-1.5 hover:opacity-90 transition-opacity"
                            >
                                Mark as Complete
                            </Button>
                            <Button
                                onClick={clearMilestoneSelection}
                                className="bg-pale text-secondary text-[0.8125rem] px-3 py-1.5 hover:bg-very-pale transition-colors"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {/* Select all checkbox */}
                {project.milestones && project.milestones.length > 0 && (isProjectOwner || userRole === "super-admin") && (
                    <div className="mb-3">
                        <Checkbox
                            checked={selectedMilestoneIds.size === project.milestones.length && project.milestones.length > 0}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    selectAllMilestones()
                                } else {
                                    clearMilestoneSelection()
                                }
                            }}
                            label="Select all"
                            className="text-sm"
                        />
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    {project.milestones && project.milestones.length > 0 ? (
                        project.milestones.map((milestone) => {
                            // Find full milestone by matching IDs (handle both string and number types)
                            const fullMilestone = milestones.find(m => {
                                const mId = typeof m.id === 'number' ? parseInt(m.id)?.toString() : m.id;
                                const milestoneId = typeof milestone.id === 'number' ? milestone.id.toString() : parseInt(milestone.id).toString();
                                return mId === milestoneId;
                            }) as MilestoneI | undefined

                            // Get permissions for this milestone
                            const permissions = getMilestonePermissions(
                                userRole as UserRole | undefined,
                                fullMilestone,
                                isProjectOwner
                            )

                            // Allow edit/delete if:
                            // 1. User is project owner (partner) OR super-admin
                            // 2. AND the handlers are provided
                            // 3. AND milestone is in an editable state (permissions check)
                            // For project owners, allow editing if milestone is in early stages
                            // "Scheduled" display status maps from PROPOSED, DRAFT, or ACCEPTED - all editable
                            const milestoneStatus = fullMilestone?.status || milestone.status;
                            const displayStatus = milestone.status?.toLowerCase() || "";

                            // Milestones with "scheduled" display status are editable (maps from PROPOSED/DRAFT/ACCEPTED)
                            // Also allow editing if actual status is in early stages
                            const isEditableStatus = displayStatus === "scheduled" ||
                                !milestoneStatus ||
                                ["PROPOSED", "DRAFT", "ACCEPTED", "FINALIZED", "FUNDED"].includes(milestoneStatus) ||
                                !["IN_PROGRESS", "SUBMITTED", "SUPERVISOR_REVIEW", "PARTNER_REVIEW", "APPROVED", "RELEASED", "COMPLETED", "CHANGES_REQUESTED"].includes(milestoneStatus);

                            // For project owners, always allow edit/delete if handlers are provided and status is editable
                            // For super-admins, use permissions check
                            const canEditDelete = (onEditMilestone || onDeleteMilestone) &&
                                ((isProjectOwner && isEditableStatus) || (userRole === "super-admin" && permissions.canEdit));

                            const milestoneIdStr = String(milestone.id)
                            const isSelected = selectedMilestoneIds.has(milestoneIdStr)

                            return (
                                <MilestoneCard
                                    key={`${milestone.id}-${fullMilestone?.status || milestone.status}`}
                                    milestone={milestone}
                                    currencySymbol={currencySymbol}
                                    formatDate={formatDate}
                                    escrowStatus={fullMilestone?.escrowStatus}
                                    supervisorGate={fullMilestone?.supervisorGate}
                                    onEdit={onEditMilestone && canEditDelete ? () => onEditMilestone(milestoneIdStr) : undefined}
                                    canEdit={canEditDelete}
                                    onDelete={onDeleteMilestone && canEditDelete ? () => onDeleteMilestone(milestoneIdStr) : undefined}
                                    canDelete={canEditDelete}
                                    onApproveAndRelease={onApproveAndRelease && permissions.canApproveAndRelease ? () => onApproveAndRelease(milestoneIdStr) : undefined}
                                    onDisapprove={onDisapprove && permissions.canDisapprove ? () => onDisapprove(milestoneIdStr) : undefined}
                                    onRequestChanges={onRequestChanges && permissions.canRequestChanges ? () => onRequestChanges(milestoneIdStr) : undefined}
                                    onMarkAsComplete={onMarkAsComplete && permissions.canMarkAsComplete ? () => onMarkAsComplete(milestoneIdStr) : undefined}
                                    onUnmarkAsComplete={onUnmarkAsComplete && permissions.canUnmarkAsComplete ? () => onUnmarkAsComplete(milestoneIdStr) : undefined}
                                    canDisapprove={permissions.canDisapprove}
                                    canMarkAsComplete={permissions.canMarkAsComplete}
                                    canUnmarkAsComplete={permissions.canUnmarkAsComplete}
                                    actualStatus={fullMilestone?.status}
                                    selected={isSelected}
                                    onSelect={(selected) => toggleMilestoneSelection(milestoneIdStr, selected)}
                                    showCheckbox={(isProjectOwner || userRole === "super-admin") && onMarkAsComplete !== undefined}
                                />
                            )
                        })
                    ) : (
                        <p className="text-sm text-muted">No milestones yet. Click &quot;Add Milestone&quot; to create one.</p>
                    )}
                </div>
            </Card>

            {attachments && attachments.length > 0 && (
                <AttachmentsCard attachments={attachments} />
            )}

            {/* Only show chat section if there's an assigned application */}
            {applications.some(a => a.status === "ASSIGNED") && (
                <Card title="Project Chat">
                    <ChatSection messages={messages} onOpenFullChat={onOpenChat} />
                </Card>
            )}
        </div>
    )
}

export default ProjectContent

