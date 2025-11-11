/**
 * KYCDocumentUpload - form for uploading KYC documents
 * PRD Reference: Section 4 - Onboarding
 */
"use client";

import React from 'react';
import Modal from '@/src/components/base/Modal';
import Button from '@/src/components/core/Button';
import { KycDocumentI } from '@/src/models/kyc';
import KYCFormFields from './KYCFormFields';
import { useKYCUpload } from '@/src/hooks/useKYCUpload';

export interface Props {
    open: boolean;
    orgId: string;
    onClose: () => void;
    onSubmit: (document: Partial<KycDocumentI>) => Promise<void>;
}

/**
 * KYCDocumentUpload component for uploading KYC documents
 * Supports multiple document types with validation
 */
const KYCDocumentUpload = (props: Props) => {
    const { open, orgId, onClose, onSubmit } = props;
    
    const {
        documentType,
        file,
        expiresAt,
        errors,
        uploading,
        setDocumentType,
        setExpiresAt,
        handleFileSelect,
        clearError,
        uploadAndSubmit,
    } = useKYCUpload(open);

    const handleSubmit = async () => {
        await uploadAndSubmit(orgId, onSubmit, onClose);
    };

    // Document type options are handled within KYCFormFields

    return (
        <>
        <Modal
            title="Upload KYC Document"
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
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                </Button>,
            ]}
        >
            <KYCFormFields
                documentType={documentType}
                file={file}
                expiresAt={expiresAt}
                errors={errors}
                onDocumentTypeChange={setDocumentType}
                onFileSelect={handleFileSelect}
                onExpiresAtChange={setExpiresAt}
                onClearError={clearError}
            />
        </Modal>
        </>
    );
};

export default KYCDocumentUpload;

