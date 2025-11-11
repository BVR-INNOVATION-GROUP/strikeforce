/**
 * AddMilestoneModal - modal for creating and editing milestones
 */
import React, { useState, useEffect } from 'react'
import Modal from '@/src/components/base/Modal'
import Button from '@/src/components/core/Button'
import AddMilestoneFormFields from './AddMilestoneFormFields'
import { validateMilestoneForm, ValidationErrors } from '@/src/utils/milestoneFormValidation'
import { OptionI } from '@/src/components/core/Select'
import { currenciesArray } from '@/src/constants/currencies'
import { MilestoneI } from '@/src/models/milestone'

export interface Props {
    open: boolean
    onClose: () => void
    onCreate: (title: string, scope: string, dueDate: string, amount: string, currency?: string) => Promise<void>
    onUpdate?: (milestoneId: string, title: string, scope: string, dueDate: string, amount: string, currency?: string) => Promise<void>
    milestone?: MilestoneI | null // Milestone to edit (if provided, modal is in edit mode)
    defaultCurrency?: string // Project currency to use as default
}

const AddMilestoneModal = (props: Props) => {
    const { open, onClose, onCreate, onUpdate, milestone, defaultCurrency } = props

    // Determine if we're in edit mode
    const isEditMode = !!milestone && !!onUpdate

    // Get default currency option from milestone currency, project currency, or default to UGX
    const getDefaultCurrency = (): OptionI | null => {
        // In edit mode, use milestone currency
        if (milestone?.currency) {
            const currency = currenciesArray.find(c => c.code === milestone.currency)
            if (currency) {
                return {
                    value: currency.code,
                    label: `${currency.code} - ${currency.name}`,
                    icon: currency.icon
                }
            }
        }
        // Otherwise use project currency
        if (defaultCurrency) {
            const currency = currenciesArray.find(c => c.code === defaultCurrency)
            if (currency) {
                return {
                    value: currency.code,
                    label: `${currency.code} - ${currency.name}`,
                    icon: currency.icon
                }
            }
        }
        // Default to UGX if no project currency
        const ugx = currenciesArray.find(c => c.code === 'UGX')
        return ugx ? {
            value: ugx.code,
            label: `${ugx.code} - ${ugx.name}`,
            icon: ugx.icon
        } : null
    }

    const [title, setTitle] = useState('')
    const [scope, setScope] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [amount, setAmount] = useState('')
    const [currency, setCurrency] = useState<OptionI | null>(getDefaultCurrency())
    const [creating, setCreating] = useState(false)
    const [errors, setErrors] = useState<ValidationErrors>({})

    /**
     * Initialize form with milestone data when editing
     */
    useEffect(() => {
        if (open && milestone) {
            // Edit mode: populate form with milestone data
            setTitle(milestone.title || '')
            setScope(milestone.scope || '')
            setDueDate(milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : '')
            setAmount(milestone.amount?.toString() || '')
            setCurrency(getDefaultCurrency())
            setErrors({})
        } else if (!open) {
            // Reset form when modal closes
            setTitle('')
            setScope('')
            setDueDate('')
            setAmount('')
            setCurrency(getDefaultCurrency())
            setErrors({})
        }
    }, [open, milestone, defaultCurrency])

    /**
     * Validate form fields
     */
    const validate = (): boolean => {
        const validationErrors = validateMilestoneForm({ title, dueDate, amount, currency })
        setErrors(validationErrors)
        return Object.keys(validationErrors).length === 0
    }

    /**
     * Clear error for a specific field
     */
    const clearError = (field: keyof ValidationErrors) => {
        setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[field]
            return newErrors
        })
    }

    const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent unknown form submission or page reload
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!validate()) {
            return
        }

        setCreating(true)
        try {
            const currencyCode = currency?.value || defaultCurrency || 'UGX'

            if (isEditMode && milestone && onUpdate) {
                // Update existing milestone
                await onUpdate(String(milestone.id), title, scope, dueDate, amount, currencyCode?.toString())
            } else {
                // Create new milestone
                await onCreate(title, scope, dueDate, amount, currencyCode?.toString())
            }

            // Close modal and reset form (will happen via useEffect)
            onClose()
        } catch (error) {
            console.error(isEditMode ? "Update failed:" : "Create failed:", error)
            // Error is already handled by parent component
        } finally {
            setCreating(false)
        }
    }

    return (
        <>
            <Modal
                title={isEditMode ? "Edit Milestone" : "Add New Milestone"}
                open={open}
                handleClose={() => {
                    onClose()
                    setErrors({})
                }}
                actions={[
                    <Button
                        key="submit"
                        type="button"
                        onClick={handleSubmit}
                        className="bg-primary"
                        disabled={creating}
                    >
                        {creating
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : (isEditMode ? 'Update Milestone' : 'Create Milestone')}
                    </Button>
                ]}
            >
                <AddMilestoneFormFields
                    title={title}
                    scope={scope}
                    dueDate={dueDate}
                    amount={amount}
                    currency={currency}
                    errors={errors}
                    onTitleChange={(title) => {
                        setTitle(title)
                        clearError('title')
                    }}
                    onScopeChange={setScope}
                    onDueDateChange={(date) => {
                        setDueDate(date)
                        clearError('dueDate')
                    }}
                    onAmountChange={(amount) => {
                        setAmount(amount)
                        clearError('amount')
                    }}
                    onCurrencyChange={(value) => {
                        setCurrency(typeof value === 'string' ? { value, label: value } as OptionI : value)
                        clearError('currency')
                    }}
                    onClearError={clearError}
                />
            </Modal>
        </>
    )
}

export default AddMilestoneModal

