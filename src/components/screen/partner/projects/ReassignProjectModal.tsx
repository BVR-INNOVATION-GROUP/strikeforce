/**
 * ReassignProjectModal - Modal for reassigning project to a different group/application
 * Shows a list of available applications that can be assigned to the project
 */
"use client"

import React, { useState } from 'react'
import Modal from '@/src/components/base/Modal'
import Button from '@/src/components/core/Button'
import Avatar from '@/src/components/core/Avatar'
import StatusIndicator from '@/src/components/core/StatusIndicator'
import Select, { OptionI } from '@/src/components/core/Select'
import { Users, CheckCircle } from 'lucide-react'
import { ApplicationI } from '@/src/models/application'

export interface ApplicationDisplayI {
    id: number
    groupName: string
    members: Array<{ name: string; avatar: string }>
    status: string
    portfolioScore: number
    appliedAt: string
    applicantType: string
    rawStatus: string
}

export interface Props {
    open: boolean
    applications: ApplicationDisplayI[]
    currentAssignedApplicationId?: number | null
    onClose: () => void
    onReassign: (applicationId: number) => Promise<void>
}

const ReassignProjectModal = (props: Props) => {
    const { open, applications, currentAssignedApplicationId, onClose, onReassign } = props

    const [selectedApplicationId, setSelectedApplicationId] = useState<OptionI | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Filter applications that can be assigned (exclude REJECTED, DECLINED, and currently ASSIGNED)
    const availableApplications = applications.filter(app => 
        app.rawStatus !== "REJECTED" && 
        app.rawStatus !== "DECLINED" &&
        app.id !== currentAssignedApplicationId
    ).map(app => ({
        ...app,
        rawStatus: app.rawStatus || app.status.toUpperCase() || "SUBMITTED"
    }))

    // Convert to Select options
    const selectOptions: OptionI[] = availableApplications.map(app => ({
        label: app.groupName,
        value: app.id
    }))

    const handleSubmit = async () => {
        if (!selectedApplicationId || !selectedApplicationId.value) {
            return
        }

        setSubmitting(true)
        try {
            const newApplicationId = typeof selectedApplicationId.value === 'number' 
                ? selectedApplicationId.value 
                : parseInt(String(selectedApplicationId.value), 10)
            
            if (!isNaN(newApplicationId)) {
                await onReassign(newApplicationId)
                setSelectedApplicationId(null)
                onClose()
            }
        } catch (error) {
            console.error('Failed to reassign project:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!submitting) {
            setSelectedApplicationId(null)
            onClose()
        }
    }

    return (
        <Modal
            open={open}
            handleClose={handleClose}
            title="Reassign Project to Group"
            actions={[
                <Button
                    key="cancel"
                    onClick={handleClose}
                    className="bg-pale"
                    disabled={submitting}
                >
                    Cancel
                </Button>,
                <Button
                    key="reassign"
                    onClick={handleSubmit}
                    className="bg-primary"
                    disabled={submitting || !selectedApplicationId || !selectedApplicationId.value}
                >
                    {submitting ? 'Reassigning...' : 'Reassign Project'}
                </Button>
            ]}
        >
            <div className="space-y-4">
                <p className="text-[0.875rem] opacity-60">
                    Select a group from the applications to assign this project to. The currently assigned group will be unassigned.
                </p>
                
                {selectOptions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-[0.875rem] opacity-60">No available applications to assign.</p>
                    </div>
                ) : (
                    <Select
                        placeHolder="Select group to reassign to..."
                        options={selectOptions}
                        value={selectedApplicationId}
                        onChange={(value) => {
                            if (value && typeof value === 'object' && 'value' in value) {
                                setSelectedApplicationId(value as OptionI)
                            }
                        }}
                    />
                )}
            </div>
        </Modal>
    )
}

export default ReassignProjectModal

