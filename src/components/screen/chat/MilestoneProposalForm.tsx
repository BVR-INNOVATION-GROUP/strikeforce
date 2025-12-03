/**
 * MilestoneProposalForm - form for proposing milestones in chat
 * PRD Reference: Section 7 - Project Chat and Milestone Negotiation
 */
"use client";

import React, { useState } from 'react';
import Modal from '@/src/components/base/Modal';
import Button from '@/src/components/core/Button';
import { MilestoneProposalI } from '@/src/models/milestone';
import { useAuthStore } from '@/src/store';
import { useToast } from '@/src/hooks/useToast';
import MilestoneProposalFormFields from './MilestoneProposalFormFields';
import { useMilestoneProposal } from '@/src/hooks/useMilestoneProposal';
import { OptionI } from '@/src/components/core/Select';

export interface Props {
    open: boolean;
    projectId: string;
    onClose: () => void;
    onSubmit: (proposal: Partial<MilestoneProposalI>) => Promise<void>;
}

/**
 * MilestoneProposalForm component for proposing milestones in chat
 * Supports creating proposals with title, scope, acceptance criteria, due date, and amount
 */
const MilestoneProposalForm = (props: Props) => {
    const { open, projectId, onClose, onSubmit } = props;
    const { user } = useAuthStore();
    const { showSuccess, showError } = useToast();
    const [submitting, setSubmitting] = useState(false);
    
    // Default currency to UGX
    const defaultCurrency: OptionI = {
        value: "UGX",
        label: "UGX - Ugandan Shilling",
        icon: "🇺🇬",
    };
    const [currency, setCurrency] = useState<OptionI | null>(defaultCurrency);
    
    const {
        title,
        scope,
        acceptanceCriteria,
        dueDate,
        amount,
        errors,
        setTitle,
        setScope,
        setAcceptanceCriteria,
        setDueDate,
        setAmount,
        clearError,
        validate,
        prepareProposal,
    } = useMilestoneProposal(open);

    /**
     * Handle form submission
     */
    const handleSubmit = async () => {
        if (!user) {
            showError('You must be logged in to propose a milestone');
            return;
        }

        if (!validate()) {
            showError('Please fix the errors before submitting');
            return;
        }

        setSubmitting(true);
        try {
            const proposalData = prepareProposal(projectId, user.id);
            await onSubmit(proposalData);
            showSuccess('Milestone proposal submitted successfully!');
            onClose();
        } catch (error) {
            console.error("Failed to submit proposal:", error);
            showError(error instanceof Error ? error.message : 'Failed to submit proposal. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
        <Modal
            title="Propose Milestone"
            open={open}
            handleClose={() => {
                onClose();
            }}
            actions={[
                <Button key="cancel" onClick={onClose} className="bg-pale text-primary">
                    Cancel
                </Button>,
                <Button 
                    key="submit" 
                    onClick={handleSubmit} 
                    className="bg-primary" 
                    disabled={submitting}
                >
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                </Button>,
            ]}
        >
            <MilestoneProposalFormFields
                title={title}
                scope={scope}
                acceptanceCriteria={acceptanceCriteria}
                dueDate={dueDate}
                amount={amount}
                currency={currency}
                errors={errors}
                onTitleChange={setTitle}
                onScopeChange={setScope}
                onAcceptanceCriteriaChange={setAcceptanceCriteria}
                onDueDateChange={setDueDate}
                onAmountChange={setAmount}
                onCurrencyChange={(value) => {
                    setCurrency(typeof value === 'string' ? null : value);
                    clearError("currency");
                }}
                onClearError={clearError}
            />
        </Modal>
        </>
    );
};

export default MilestoneProposalForm;

