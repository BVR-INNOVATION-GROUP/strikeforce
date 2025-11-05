/**
 * DisputeResolutionModal - modal for resolving disputes
 */
import React from 'react'
import Modal from '@/src/components/base/Modal'
import Button from '@/src/components/core/Button'
import TextArea from '@/src/components/core/TextArea'
import { DisputeI } from '@/src/models/dispute'
import { CheckCircle } from 'lucide-react'

export interface Props {
    open: boolean
    dispute: DisputeI | null
    resolution: string
    onClose: () => void
    onResolutionChange: (value: string) => void
    onSubmit: () => void
}

const DisputeResolutionModal = (props: Props) => {
    const { open, dispute, resolution, onClose, onResolutionChange, onSubmit } = props

    if (!dispute) return null

    return (
        <Modal
            title="Resolve Dispute"
            open={open}
            handleClose={onClose}
            actions={[
                <Button key="cancel" onClick={onClose} className="bg-pale text-primary">
                    Cancel
                </Button>,
                <Button key="submit" onClick={onSubmit} className="bg-primary">
                    <CheckCircle size={16} className="mr-2" />
                    Submit Resolution
                </Button>,
            ]}
        >
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-secondary mb-1">Dispute Reason</p>
                    <p className="font-semibold">{dispute.reason}</p>
                </div>
                <div>
                    <p className="text-sm text-secondary mb-1">Description</p>
                    <p className="text-sm">{dispute.description}</p>
                </div>
                {dispute.evidence.length > 0 && (
                    <div>
                        <p className="text-sm text-secondary mb-2">Evidence</p>
                        <div className="space-y-1">
                            {dispute.evidence.map((evidence, idx) => (
                                <a
                                    key={idx}
                                    href={evidence}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm block"
                                >
                                    Evidence {idx + 1}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                <TextArea
                    title="Resolution"
                    value={resolution}
                    onChange={(e) => onResolutionChange(e.target.value)}
                    rows={6}
                    placeholder="Enter your resolution decision and reasoning..."
                />
            </div>
        </Modal>
    )
}

export default DisputeResolutionModal





