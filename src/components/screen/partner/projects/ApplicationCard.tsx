/**
 * ApplicationCard - displays individual application information
 * Shows group/individual details, portfolio score, and action buttons
 */
import React from 'react'
import Button from '@/src/components/core/Button'
import StatusIndicator from '@/src/components/core/StatusIndicator'
import Avatar from '@/src/components/core/Avatar'
import { Users } from 'lucide-react'
import { ApplicationI } from '@/src/models/application'

export interface ApplicationDisplayI {
    id: number
    groupName: string
    members: Array<{ name: string; avatar: string }>
    status: string
    portfolioScore: number
    appliedAt: string
}

export interface Props {
    application: ApplicationDisplayI
    applicationData: ApplicationI
    hasAssignedApplication?: boolean
    onViewProfile: (applicationId: number) => void
    onMessage: (applicationId: number) => void
    onReassign?: (applicationId: number) => void
    onAccept?: (applicationId: number) => void
    onReject?: (applicationId: number) => void
    onRecommend?: (applicationId: number) => void
    onWithdraw?: (applicationId: number) => void
    onTerminate?: (applicationId: number) => void
    formatDate: (dateString: string) => string
    currentUserId?: string | number
    userRole?: string
}

const ApplicationCard = (props: Props) => {
    const { 
        application, 
        applicationData, 
        hasAssignedApplication = false, 
        onViewProfile, 
        onMessage, 
        onReassign, 
        onAccept, 
        onReject, 
        onRecommend,
        onWithdraw,
        onTerminate,
        formatDate,
        currentUserId,
        userRole
    } = props
    
    // Check if current user is a student and part of this application
    // Handle both string and number IDs
    const numericUserId = currentUserId !== undefined && currentUserId !== null
      ? (typeof currentUserId === 'string' ? parseInt(currentUserId, 10) : Number(currentUserId))
      : undefined
    
    // Convert studentIds to numbers for comparison (they might be strings or numbers)
    const numericStudentIds = applicationData.studentIds.map(id => {
      if (typeof id === 'string') {
        return parseInt(id, 10);
      }
      return Number(id);
    })
    
    // Check if user ID is in the studentIds array (using strict equality after conversion)
    const isStudentViewingOwnApplication = userRole === 'student' && 
      numericUserId !== undefined && 
      numericUserId !== null &&
      !isNaN(numericUserId) &&
      numericStudentIds.some(id => Number(id) === Number(numericUserId))
    
    // Determine which actions to show based on application status
    // Hide accept/reject if there's already an assigned application
    const showManagementActions = (applicationData.status === "SUBMITTED" || applicationData.status === "SHORTLISTED" || applicationData.status === "WAITLIST") && !hasAssignedApplication
    const showReassign = applicationData.status === "ASSIGNED" && onReassign
    const showRecommendForAssigned = applicationData.status === "ASSIGNED" && onRecommend
    // Only show message button if this application is assigned or if there's an assigned application
    const showMessageButton = applicationData.status === "ASSIGNED" || hasAssignedApplication
    
    // Student actions
    const canWithdraw = isStudentViewingOwnApplication && 
        (applicationData.status === "SUBMITTED" || applicationData.status === "SHORTLISTED" || applicationData.status === "WAITLIST") &&
        onWithdraw
    const canTerminate = isStudentViewingOwnApplication && 
        applicationData.status === "ASSIGNED" && 
        onTerminate

    return (
        <div className="rounded-lg p-6 bg-pale hover:bg-very-pale transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h4 className="text-[0.9375rem] font-[600] mb-2">{application.groupName}</h4>
                    <div className="flex items-center gap-3 mb-3">
                        <StatusIndicator status={application.status} />
                        <span className="text-[0.8125rem] opacity-60">Portfolio Score: {application.portfolioScore}%</span>
                    </div>
                </div>
                <span className="text-[0.8125rem] opacity-60">{formatDate(application.appliedAt)}</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
                <Users size={16} className="opacity-60" />
                <div className="flex -space-x-2">
                    {application.members.map((member, idx) => (
                        <Avatar
                            key={idx}
                            src={member.avatar}
                            alt={member.name}
                            size="sm"
                            className="border-2 border-paper"
                        />
                    ))}
                </div>
                <span className="text-[0.8125rem] opacity-60 ml-2">
                    {application.members.length} member{application.members.length > 1 ? 's' : ''}
                </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
                <Button
                    onClick={() => onViewProfile(application.id)}
                    className="bg-pale text-[0.875rem] py-2 px-4"
                >
                    View Details
                </Button>
                {showMessageButton && (
                    <Button
                        onClick={() => onMessage(application.id)}
                        className="bg-primary text-[0.875rem] py-2 px-4"
                    >
                        Message
                    </Button>
                )}
                
                {/* Management actions for pending applications */}
                {showManagementActions && (
                    <>
                        {onRecommend && (
                            <Button
                                onClick={() => onRecommend(application.id)}
                                className="bg-paper text-[0.875rem] py-2 px-4"
                            >
                                Recommend
                            </Button>
                        )}
                        {onAccept && applicationData.status !== "ASSIGNED" && (
                            <Button
                                onClick={() => onAccept(application.id)}
                                className="bg-green-500 text-white text-[0.875rem] py-2 px-4"
                            >
                                Accept
                            </Button>
                        )}
                        {onReject && applicationData.status !== "REJECTED" && (
                            <Button
                                onClick={() => onReject(application.id)}
                                className="bg-primary opacity-90 hover:opacity-100 text-white text-[0.875rem] py-2 px-4"
                            >
                                Reject
                            </Button>
                        )}
                    </>
                )}
                
                {/* Recommend button for assigned applications */}
                {showRecommendForAssigned && onRecommend && (
                    <Button
                        onClick={() => onRecommend(application.id)}
                        className="bg-paper text-[0.875rem] py-2 px-4"
                    >
                        Recommend
                    </Button>
                )}

                {/* Reassign button for assigned applications - opens modal */}
                {showReassign && (
                    <Button
                        onClick={() => onReassign && onReassign(application.id)}
                        className="bg-pale text-[0.875rem] py-2 px-4"
                    >
                        Reassign Group
                    </Button>
                )}
                
                {/* Student actions */}
                {canWithdraw && (
                    <Button
                        onClick={() => onWithdraw && onWithdraw(application.id)}
                        className="bg-orange-500 text-white text-[0.875rem] py-2 px-4"
                    >
                        Withdraw Application
                    </Button>
                )}
                {canTerminate && (
                    <Button
                        onClick={() => onTerminate && onTerminate(application.id)}
                        className="bg-red-500 text-white text-[0.875rem] py-2 px-4"
                    >
                        Terminate Contract
                    </Button>
                )}
            </div>
        </div>
    )
}

export default ApplicationCard

