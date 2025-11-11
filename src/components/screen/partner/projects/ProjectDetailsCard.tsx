/**
 * ProjectDetailsCard - displays budget, deadline, and capacity
 */
import React from 'react'
import Card from '@/src/components/core/Card'
import { DollarSign, Calendar, Users } from 'lucide-react'

export interface Props {
    budget: number
    currencySymbol: string
    deadline: string
    capacity: number
    daysUntilDeadline: number
    formatDate: (dateString: string) => string
}

const ProjectDetailsCard = (props: Props) => {
    const { budget, currencySymbol, deadline, capacity, daysUntilDeadline, formatDate } = props

    return (
        <Card title="Project Details">
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <DollarSign size={20} className="opacity-60" />
                    <div>
                        <p className="text-[0.8125rem] opacity-60 mb-1">Budget</p>
                        <p className="text-[0.9375rem] font-[600]">{currencySymbol}{budget.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Calendar size={20} className="opacity-60" />
                    <div>
                        <p className="text-[0.8125rem] opacity-60 mb-1">Deadline</p>
                        <p className="text-[0.9375rem] font-[600] mb-1">{formatDate(deadline)}</p>
                        <p
                            className={`text-[0.8125rem] ${
                                daysUntilDeadline < 30
                                    ? 'text-error'
                                    : daysUntilDeadline < 60
                                    ? 'text-warning'
                                    : 'opacity-60'
                            }`}
                        >
                            {daysUntilDeadline > 0 ? `${daysUntilDeadline} days remaining` : 'Overdue'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Users size={20} className="opacity-60" />
                    <div>
                        <p className="text-[0.8125rem] opacity-60 mb-1">Capacity</p>
                        <p className="text-[0.9375rem] font-[600]">
                            {capacity} student{capacity > 1 ? 's' : ''}/group{capacity > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default ProjectDetailsCard

