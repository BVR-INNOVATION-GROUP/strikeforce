/**
 * ProjectHeader - displays project title and status
 */
import React from 'react'
import Button from '@/src/components/core/Button'
import StatusIndicator from '@/src/components/core/StatusIndicator'
import { MessageSquare } from 'lucide-react'

export interface Props {
    title: string
    status: string
    createdAt: string
    onBack: () => void
    onOpenChat?: () => void
    formatDate: (dateString: string) => string
}

const ProjectHeader = (props: Props) => {
    const { title, status, createdAt, onOpenChat, formatDate } = props

    return (
        <div className="flex items-center gap-6">
            <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {onOpenChat && (
                        <Button
                            onClick={onOpenChat}
                            className="bg-primary text-[0.875rem] flex items-center justify-center gap-2 py-2.5 px-4"
                        >
                            <MessageSquare size={18} />
                            Open Full Chat
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <StatusIndicator status={status} />
                    <span className="text-[0.875rem] opacity-60">Created {formatDate(createdAt)}</span>
                </div>
            </div>
        </div>
    )
}

export default ProjectHeader

