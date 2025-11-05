/**
 * ApplicationForm - form for students to apply to projects as Individual or Group
 * PRD Reference: Section 6 - Groups and Applications
 */
"use client";

import React from 'react';
import Modal from '@/src/components/base/Modal';
import Button from '@/src/components/core/Button';
import { ApplicationI } from '@/src/models/application';
import { GroupI } from '@/src/models/group';
import { useAuthStore } from '@/src/store';
import { useToast } from '@/src/hooks/useToast';
import ApplicationFormFields from './ApplicationFormFields';
import { useApplicationForm } from '@/src/hooks/useApplicationForm';

export interface Props {
    open: boolean;
    projectId: string;
    onClose: () => void;
    onSubmit: (application: Partial<ApplicationI>) => Promise<void>;
    groups?: GroupI[];
}

/**
 * ApplicationForm component for students to apply to projects
 * Supports Individual and Group applications with validation
 */
const ApplicationForm = (props: Props) => {
    const { open, projectId, onClose, onSubmit, groups = [] } = props;
    const { user } = useAuthStore();
    const { showSuccess, showError } = useToast();
    
    const {
        applicantType,
        selectedGroupId,
        statement,
        errors,
        submitting,
        availableGroups,
        setApplicantType,
        setSelectedGroupId,
        setStatement,
        clearError,
        validate,
    } = useApplicationForm(open, groups, user);

    /**
     * Handle form submission
     */
    const handleSubmit = async () => {
        if (!user) {
            showError('You must be logged in to apply');
            return;
        }

        if (!validate()) {
            showError('Please fix the errors before submitting');
            return;
        }

        // Set submitting state (would need to add to hook or handle here)
        try {
            const studentIds = applicantType === "INDIVIDUAL" 
                ? [user.id] 
                : availableGroups.find(g => g.id === selectedGroupId)?.memberIds || [user.id];

            const applicationData: Partial<ApplicationI> = {
                projectId,
                applicantType,
                studentIds,
                groupId: applicantType === "GROUP" ? selectedGroupId : undefined,
                statement: statement.trim(),
                status: "SUBMITTED",
            };

            await onSubmit(applicationData);
            showSuccess('Application submitted successfully!');
            onClose();
        } catch (error) {
            console.error("Failed to submit application:", error);
            showError(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
        }
    };

    return (
        <>
        <Modal
            title="Apply to Project"
            open={open}
            handleClose={onClose}
            actions={[
                <Button key="cancel" onClick={onClose} className="bg-pale text-primary">
                    Cancel
                </Button>,
                <Button 
                    key="submit" 
                    onClick={handleSubmit} 
                    className="bg-primary"
                >
                    Submit Application
                </Button>,
            ]}
        >
            <ApplicationFormFields
                applicantType={applicantType}
                selectedGroupId={selectedGroupId}
                statement={statement}
                availableGroups={availableGroups}
                errors={errors}
                onApplicantTypeChange={setApplicantType}
                onGroupChange={setSelectedGroupId}
                onStatementChange={setStatement}
                onClearError={clearError}
            />
        </Modal>
        </>
    );
};

export default ApplicationForm;

