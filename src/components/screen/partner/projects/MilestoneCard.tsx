/**
 * MilestoneCard - displays individual milestone information
 */
import StatusIndicator from '@/src/components/core/StatusIndicator'
import Button from '@/src/components/core/Button'
import Checkbox from '@/src/components/core/Checkbox'
import { Calendar, CheckCircle2, AlertTriangle, Edit, RotateCcw, AlertCircle } from 'lucide-react'
import { currenciesArray } from '@/src/constants/currencies'

export interface MilestoneDisplayI {
    id: number
    title: string
    status: string
    dueDate: string
    amount: number
    currency?: string
    progress?: number
    completedDate?: string
}

export interface Props {
    milestone: MilestoneDisplayI
    currencySymbol?: string // Deprecated - kept for backward compatibility
    formatDate: (dateString: string) => string
    escrowStatus?: string
    supervisorGate?: boolean
    actualStatus?: string // The actual milestone status (not transformed) - e.g., "RELEASED", "COMPLETED"
    onApproveAndRelease?: () => void
    onDisapprove?: () => void
    onRequestChanges?: () => void
    onMarkAsComplete?: () => void
    onUnmarkAsComplete?: () => void
    onEdit?: () => void // Callback for editing milestone
    canEdit?: boolean // Whether user can edit this milestone
    onDelete?: () => void // Callback for deleting milestone
    canDelete?: boolean // Whether user can delete this milestone
    canDisapprove?: boolean // Whether user can disapprove milestone (revert approval)
    canMarkAsComplete?: boolean // Whether user can mark as complete
    canUnmarkAsComplete?: boolean // Whether user can unmark as complete
    onDispute?: () => void // Callback for raising dispute
    canDispute?: boolean // Whether user can raise dispute for this milestone
    selected?: boolean // Whether this milestone is selected
    onSelect?: (selected: boolean) => void // Callback for selection change
    showCheckbox?: boolean // Whether to show checkbox for selection
}

const MilestoneCard = (props: Props) => {
    const { milestone, currencySymbol, formatDate, supervisorGate, actualStatus, onApproveAndRelease, onDisapprove, onRequestChanges, onMarkAsComplete, onUnmarkAsComplete, onEdit, canEdit, onDelete, canDelete, canDisapprove, onDispute, canDispute, selected = false, onSelect, showCheckbox = false } = props

    // Get currency symbol from milestone currency or fallback to prop
    const getCurrencySymbol = (): string => {
        if (milestone.currency) {
            const currencyInfo = currenciesArray.find(c => c.code === milestone.currency)
            return currencyInfo?.symbol || milestone.currency
        }
        return currencySymbol || "$" // Fallback to prop or default
    }

    const displayCurrencySymbol = getCurrencySymbol()

    // Determine which action buttons to show
    // If milestone is COMPLETED, only show Undo action - hide all other actions
    // actualStatus comes from fullMilestone?.status (the actual model status, not transformed)
    // Primary check: actualStatus (from model), fallback to display status if actualStatus is undefined
    const isCompleted = actualStatus ? actualStatus === "COMPLETED" : milestone.status === "completed";

    // When completed, only show Undo button - hide all other action buttons
    if (isCompleted) {
        return (
            <div className="rounded-lg p-6 bg-pale">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[0.9375rem] font-[600] flex-1">{milestone.title}</h4>
                    <div className="flex items-center gap-2 ml-4">
                        {onUnmarkAsComplete && (
                            <Button
                                onClick={onUnmarkAsComplete}
                                className="bg-pale text-[0.8125rem] px-3 py-1.5 flex items-center gap-1.5"
                            >
                                <RotateCcw size={14} />
                                Undo
                            </Button>
                        )}
                        <StatusIndicator status={milestone.status} />
                    </div>
                </div>

                {/* Milestone details */}
                <div className="flex items-center gap-4 text-[0.875rem] opacity-60">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Due: {formatDate(milestone.dueDate)}
                    </div>
                    <div className="flex items-center gap-2">
                        <span>{displayCurrencySymbol}{milestone.amount.toLocaleString()}</span>
                    </div>
                </div>
                {milestone.status === "completed" && milestone.completedDate && (
                    <div className="flex items-center gap-2 text-[0.8125rem] text-success mt-3">
                        <CheckCircle2 size={16} />
                        Completed on {formatDate(milestone.completedDate)}
                    </div>
                )}
            </div>
        )
    }

    // For non-completed milestones, show appropriate actions
    const showEditButton = canEdit && onEdit;
    const showDeleteButton = canDelete && onDelete;
    // Show Approve button only if status is PARTNER_REVIEW (not RELEASED or COMPLETED)
    const isPartnerReview = actualStatus === "PARTNER_REVIEW" || milestone.status === "partner-review";
    const showApproveButton = isPartnerReview && supervisorGate && onApproveAndRelease;
    const showRequestChangesButton = isPartnerReview && supervisorGate && onRequestChanges;
    // Show Disapprove button if milestone is RELEASED (revert approval)
    const isReleased = actualStatus === "RELEASED" || milestone.status === "released";
    const showDisapproveButton = onDisapprove && canDisapprove && isReleased;
    // Hide Mark Complete button when showing Disapprove (when approved, show disapprove instead)
    // Mark Complete should only show when we want to mark as fully completed (separate from approval)
    const showMarkAsCompleteButton = onMarkAsComplete && isReleased && !showDisapproveButton;

    return (
        <div className={`rounded-lg p-6 bg-pale ${selected ? 'border border-primary' : 'border border-transparent'}`}>
            {/* Title row with actions on the right */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                    {showCheckbox && onSelect && (
                        <Checkbox
                            checked={selected}
                            onChange={(e) => onSelect(e.target.checked)}
                        />
                    )}
                    <h4 className="text-[0.9375rem] font-[600] flex-1">{milestone.title}</h4>
                </div>
                <div className="flex items-center gap-2 ml-4">
                    {/* Edit Button - Icon only */}
                    {showEditButton && (
                        <button
                            onClick={onEdit}
                            className="p-2 rounded hover:bg-very-pale transition-colors"
                            title="Edit milestone"
                        >
                            <Edit size={16} className="text-primary" />
                        </button>
                    )}
                    {/* Delete Button - Icon only */}
                    {showDeleteButton && (
                        <button
                            onClick={onDelete}
                            className="p-2 rounded hover:bg-red-50 transition-colors"
                            title="Delete milestone"
                        >
                            <AlertTriangle size={16} className="text-red-500" />
                        </button>
                    )}
                    {/* Approve and Release Button */}
                    {showApproveButton && (
                        <Button
                            onClick={onApproveAndRelease}
                            className="bg-green-500 text-white text-[0.8125rem] px-3 py-1.5 flex items-center gap-1.5"
                        >
                            <CheckCircle2 size={14} />
                            Approve
                        </Button>
                    )}
                    {/* Request Changes Button */}
                    {showRequestChangesButton && (
                        <Button
                            onClick={onRequestChanges}
                            className="bg-yellow-500 text-white text-[0.8125rem] px-3 py-1.5 flex items-center gap-1.5"
                        >
                            Request Changes
                        </Button>
                    )}
                    {/* Disapprove Button - shows when RELEASED (to revert approval) */}
                    {showDisapproveButton && (
                        <Button
                            onClick={onDisapprove}
                            className="bg-red-500 text-white text-[0.8125rem] px-3 py-1.5 flex items-center gap-1.5"
                        >
                            <RotateCcw size={14} />
                            Disapprove
                        </Button>
                    )}
                    {/* Mark as Complete Button - shows when RELEASED and not showing disapprove */}
                    {showMarkAsCompleteButton && (
                        <Button
                            onClick={onMarkAsComplete}
                            className="bg-primary text-white text-[0.8125rem] px-3 py-1.5 flex items-center gap-1.5"
                        >
                            <CheckCircle2 size={14} />
                            Mark Complete
                        </Button>
                    )}
                    {/* Dispute Button - shows for partners when milestone is in certain states */}
                    {onDispute && canDispute && (
                        <Button
                            onClick={onDispute}
                            className="bg-pale text-primary text-[0.8125rem] px-3 py-1.5 flex items-center gap-1.5"
                        >
                            <AlertCircle size={14} />
                            Raise Dispute
                        </Button>
                    )}
                    {/* Status Indicator */}
                    <StatusIndicator status={milestone.status} />
                </div>
            </div>

            {/* Milestone details */}
            <div className="flex items-center gap-4 text-[0.875rem] opacity-60">
                <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Due: {formatDate(milestone.dueDate)}
                </div>
                <div className="flex items-center gap-2">
                    <span>{displayCurrencySymbol}{milestone.amount.toLocaleString()}</span>
                </div>
            </div>
            {milestone.status === "in-progress" && milestone.progress !== undefined && (
                <div className="mt-4">
                    <div className="flex justify-between text-[0.8125rem] mb-2">
                        <span>Progress</span>
                        <span>{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-very-pale rounded-full h-2.5">
                        <div
                            className="bg-primary h-2.5 rounded-full transition-all"
                            style={{ width: `${milestone.progress}%` }}
                        />
                    </div>
                </div>
            )}
            {milestone.status === "completed" && milestone.completedDate && (
                <div className="flex items-center gap-2 text-[0.8125rem] text-success mt-3">
                    <CheckCircle2 size={16} />
                    Completed on {formatDate(milestone.completedDate)}
                </div>
            )}
        </div>
    )
}

export default MilestoneCard

