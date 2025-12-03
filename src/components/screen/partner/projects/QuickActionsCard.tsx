/**
 * QuickActionsCard - displays quick action buttons
 */
import React from 'react'
import Card from '@/src/components/core/Card'
import Button from '@/src/components/core/Button'
import { Download, Share2, RefreshCw, Trash2, UserPlus } from 'lucide-react'

export interface Props {
    onEditProject?: () => void
    onExportDetails: () => void
    onShareProject: () => void
    onReassignProject?: () => void
    onDeleteProject?: () => void
    onRequestSupervisor?: () => void
}

const QuickActionsCard = (props: Props) => {
    const { onEditProject, onExportDetails, onShareProject, onReassignProject, onDeleteProject, onRequestSupervisor } = props

    return (
        <Card title="Quick Actions">
            <div className="flex flex-col gap-3">
                {onEditProject && (
                    <Button onClick={onEditProject} className="bg-primary w-full text-[0.875rem] py-2.5">
                        Edit Project
                    </Button>
                )}
                <Button
                    onClick={onExportDetails}
                    className="bg-pale w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5"
                >
                    <Download size={18} />
                    Export Details
                </Button>
                <Button
                    onClick={onShareProject}
                    className="bg-pale w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5"
                >
                    <Share2 size={18} />
                    Share Project
                </Button>
                {onReassignProject && (
                    <Button
                        onClick={onReassignProject}
                        className="bg-pale w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5"
                    >
                        <RefreshCw size={18} />
                        Reassign Project
                    </Button>
                )}
                {onRequestSupervisor && (
                    <Button
                        onClick={onRequestSupervisor}
                        className="bg-pale w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5"
                    >
                        <UserPlus size={18} />
                        Request Supervisor
                    </Button>
                )}
                {onDeleteProject && (
                    <Button
                        onClick={onDeleteProject}
                        className="bg-primary opacity-90 hover:opacity-100 w-full flex items-center justify-center gap-2 text-[0.875rem] py-2.5 text-white"
                    >
                        <Trash2 size={18} />
                        Delete Project
                    </Button>
                )}
            </div>
        </Card>
    )
}

export default QuickActionsCard

