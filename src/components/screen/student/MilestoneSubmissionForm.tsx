/**
 * MilestoneSubmissionForm - form for students to submit milestone deliverables
 * PRD Reference: Section 9 - Milestone Lifecycle
 */
"use client";

import React, { useState } from 'react';
import Modal from '@/src/components/base/Modal';
import Button from '@/src/components/core/Button';
import TextArea from '@/src/components/core/TextArea';
import { SubmissionI } from '@/src/models/submission';
import { MilestoneI } from '@/src/models/milestone';
import { useAuthStore } from '@/src/store';
import { useToast } from '@/src/hooks/useToast';
import MilestoneSubmissionDetails from './MilestoneSubmissionDetails';
import SubmissionFileList from './SubmissionFileList';
import SubmissionReviewInfo from './SubmissionReviewInfo';
import { useMilestoneSubmission } from '@/src/hooks/useMilestoneSubmission';

export interface Props {
    open: boolean;
    milestone: MilestoneI;
    onClose: () => void;
    onSubmit: (submission: Partial<SubmissionI>) => Promise<void>;
}

/**
 * MilestoneSubmissionForm component for submitting milestone deliverables
 * Supports file uploads and notes
 */
const MilestoneSubmissionForm = (props: Props) => {
    const { open, milestone, onClose, onSubmit } = props;
    const { user } = useAuthStore();
    const { showSuccess, showError } = useToast();
    const [submitting, setSubmitting] = useState(false);
    
    const {
        notes,
        files,
        errors,
        setNotes,
        setFiles,
        clearError,
        validate,
        prepareSubmission,
    } = useMilestoneSubmission(open);

    /**
     * Handle form submission
     */
    const handleSubmit = async () => {
        if (!user) {
            showError('You must be logged in to submit work');
            return;
        }

        if (!validate()) {
            showError('Please fix the errors before submitting');
            return;
        }

        setSubmitting(true);
        try {
            const submissionData = await prepareSubmission(milestone, user.id);
            await onSubmit(submissionData);
            showSuccess('Submission submitted successfully! It will be reviewed by the supervisor.');
            onClose();
        } catch (error) {
            console.error("Failed to submit work:", error);
            showError(error instanceof Error ? error.message : 'Failed to submit work. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
        <Modal
            title={`Submit Work - ${milestone.title}`}
            open={open}
            handleClose={() => {
                onClose();
                setErrors({});
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
                    {submitting ? 'Submitting...' : 'Submit Work'}
                </Button>,
            ]}
        >
            <div className="flex flex-col gap-6">
                <MilestoneSubmissionDetails milestone={milestone} />

                <SubmissionFileList
                    files={files}
                    errors={errors}
                    onFileSelect={setFiles}
                    onClearError={() => clearError('files')}
                />

                <TextArea
                    title="Submission Notes *"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe what you've delivered, any changes made, challenges encountered, or additional context..."
                    rows={6}
                    error={errors.notes}
                />

                <SubmissionReviewInfo />
            </div>
        </Modal>
        </>
    );
};

export default MilestoneSubmissionForm;

