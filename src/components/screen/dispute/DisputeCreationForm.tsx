/**
 * DisputeCreationForm - form for creating disputes
 * PRD Reference: Section 12 - Compliance, Disputes, and Audit
 */
"use client";

import React from 'react';
import Modal from '@/src/components/base/Modal';
import Button from '@/src/components/core/Button';
import { DisputeSubjectType, DisputeI } from '@/src/models/dispute';
import DisputeFormFields from './DisputeFormFields';
import { useDisputeCreation } from '@/src/hooks/useDisputeCreation';

export interface Props {
    open: boolean;
    subjectType: DisputeSubjectType;
    subjectId: string;
    onClose: () => void;
    onSubmit: (dispute: Partial<DisputeI>) => Promise<void>;
}

/**
 * DisputeCreationForm component for raising disputes
 * Supports multiple subject types with evidence uploads
 */
const DisputeCreationForm = (props: Props) => {
    const { open, subjectType, subjectId, onClose, onSubmit } = props;
    
    const {
        reason,
        description,
        evidenceFiles,
        errors,
        submitting,
        setReason,
        setDescription,
        handleFileSelect,
        clearError,
        submitDispute,
        reset,
    } = useDisputeCreation(open);

    const handleSubmit = async () => {
        await submitDispute(subjectType, subjectId, onSubmit, () => {
            reset();
            onClose();
        });
    };

    const reasonOptions = [
        { value: "Quality concerns", label: "Quality concerns" },
        { value: "Payment issues", label: "Payment issues" },
        { value: "Timeline disputes", label: "Timeline disputes" },
        { value: "Scope changes", label: "Scope changes" },
        { value: "Communication issues", label: "Communication issues" },
        { value: "Other", label: "Other" },
    ];

    return (
        <>
        <Modal
            title="Raise Dispute"
            open={open}
            handleClose={() => {
                reset();
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
                    {submitting ? 'Submitting...' : 'Raise Dispute'}
                </Button>,
            ]}
        >
            <DisputeFormFields
                subjectType={subjectType}
                subjectId={subjectId}
                reason={reason}
                description={description}
                evidenceFiles={evidenceFiles}
                errors={errors}
                onReasonChange={setReason}
                onDescriptionChange={setDescription}
                onFileSelect={handleFileSelect}
                onClearError={clearError}
            />
        </Modal>
        </>
    );
};

export default DisputeCreationForm;

