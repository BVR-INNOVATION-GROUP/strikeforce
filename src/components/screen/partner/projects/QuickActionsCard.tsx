/**
 * QuickActionsCard - displays quick action buttons
 */
import React from 'react'
import Card from '@/src/components/core/Card'
import Button from '@/src/components/core/Button'
import { Download, Share2, RefreshCw, Trash2, UserPlus, X, Send, Pencil } from 'lucide-react'

export interface Props {
    onEditProject?: () => void
    onExportDetails: () => void
    onShareProject: () => void
    onReassignProject?: () => void
    onDeleteProject?: () => void
    onRequestSupervisor?: () => void
    onWithdrawApplication?: () => void
    onApply?: () => void
}

const QuickActionsCard = (props: Props) => {
    const { onEditProject, onExportDetails, onShareProject, onReassignProject, onDeleteProject, onRequestSupervisor, onWithdrawApplication, onApply } = props

    return (
        <Card title="Quick Actions">
            <div className="flex flex-col gap-3">
                {onEditProject && (
                    <Button onClick={onEditProject} className="bg-primary w-full text-[0.875rem] py-2.5 flex items-center justify-center gap-2">
                        <Pencil size={18} />
                        <span className="hidden sm:inline">Edit Project</span>
                    </Button>
                )}
                <Button
                    onClick={onExportDetails}
                    className="bg-pale w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5"
                >
                    <Download size={18} />
                    <span className="hidden sm:inline">Export Details</span>
                </Button>
                <Button
                    onClick={onShareProject}
                    className="bg-pale w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5"
                >
                    <Share2 size={18} />
                    <span className="hidden sm:inline">Share Project</span>
                </Button>
                {onReassignProject && (
                    <Button
                        onClick={onReassignProject}
                        className="bg-pale w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5"
                    >
                        <RefreshCw size={18} />
                        <span className="hidden sm:inline">Reassign Project</span>
                    </Button>
                )}
                {onRequestSupervisor && (
                    <Button
                        onClick={onRequestSupervisor}
                        className="bg-pale w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5"
                    >
                        <UserPlus size={18} />
                        <span className="hidden sm:inline">Request Supervisor</span>
                    </Button>
                )}
                {onApply && (
                    <Button
                        onClick={onApply}
                        className="bg-primary btn-keep-primary hover:opacity-90 w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5 text-white"
                    >
                        <Send size={18} />
                        <span className="hidden sm:inline">Apply</span>
                    </Button>
                )}
                {onWithdrawApplication && (
                    <Button
                        onClick={onWithdrawApplication}
                        className="bg-pale w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5 text-red-600 hover:text-red-700"
                    >
                        <X size={18} />
                        <span className="hidden sm:inline">Withdraw Application</span>
                    </Button>
                )}
                {onDeleteProject && (
                    <Button
                        onClick={onDeleteProject}
                        className="bg-primary opacity-90 hover:opacity-100 w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5 text-white"
                    >
                        <Trash2 size={18} />
                        <span className="hidden sm:inline">Delete Project</span>
                    </Button>
                )}
            </div>
        </Card>
    )
}

export default QuickActionsCard

