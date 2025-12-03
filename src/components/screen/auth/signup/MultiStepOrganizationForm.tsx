/**
 * Multi-Step Organization Signup Form Component
 */
"use client";

import React, { useState } from "react";
import Input from "@/src/components/core/Input";
import TextArea from "@/src/components/core/TextArea";
import { MultiStepForm } from "./MultiStepForm";
import { OrganizationSignupFormData, ValidationErrors } from "@/src/utils/organizationSignupValidation";
import LogoUpload from "./LogoUpload";

export interface Props {
    formData: OrganizationSignupFormData;
    errors: ValidationErrors;
    isUniversity?: boolean;
    onFieldChange: (field: keyof OrganizationSignupFormData, value: string) => void;
    onClearError: (field: string) => void;
    currentStep: number;
    onStepChange: (step: number) => void;
    onLogoFileChange?: (file: File | null) => void;
}

const MultiStepOrganizationForm: React.FC<Props> = ({
    formData,
    errors,
    isUniversity = false,
    onFieldChange,
    onClearError,
    currentStep,
    onStepChange,
    onLogoFileChange,
}) => {
    const orgTypeName = isUniversity ? "University" : "Organization";

    const steps = [
        {
            id: 1,
            title: "Basic Info",
            description: "Organization details",
        },
        {
            id: 2,
            title: "Contact",
            description: "Contact information",
        },
        {
            id: 3,
            title: "Additional",
            description: "Optional details",
        },
    ];

    // Validate current step before allowing progression
    const validateStep = (step: number): boolean => {
        if (step === 0) {
            // Step 1: Basic Info
            return !!(
                formData.orgName?.trim().length >= 2 &&
                formData.email &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
                formData.password &&
                formData.password.length >= 8
            );
        } else if (step === 1) {
            // Step 2: Contact Info
            return !!(
                formData.contactName?.trim().length >= 2 &&
                formData.phone?.trim().length >= 10 &&
                formData.address?.trim().length >= 5
            );
        }
        // Step 3 has no required fields
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < steps.length - 1) {
                onStepChange(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            onStepChange(currentStep - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-xl font-semibold text-default mb-2">
                                Basic Information
                            </h2>
                            <p className="text-sm text-secondary">
                                Let's start with your {orgTypeName.toLowerCase()} details
                            </p>
                        </div>

                        <div className="space-y-5">
                            <Input
                                title={`${orgTypeName} Name *`}
                                value={formData.orgName}
                                onChange={(e) => {
                                    onFieldChange("orgName", e.target.value);
                                    onClearError("orgName");
                                }}
                                placeholder={`Enter ${orgTypeName.toLowerCase()} name`}
                                error={errors.orgName}
                            />

                            <Input
                                title="Email Address *"
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                    onFieldChange("email", e.target.value);
                                    onClearError("email");
                                }}
                                placeholder="contact@example.com"
                                error={errors.email}
                            />

                            <Input
                                title="Password *"
                                type="password"
                                value={formData.password}
                                onChange={(e) => {
                                    onFieldChange("password", e.target.value);
                                    onClearError("password");
                                }}
                                placeholder="At least 8 characters"
                                error={errors.password}
                            />


                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-xl font-semibold text-default mb-2">
                                Contact Information
                            </h2>
                            <p className="text-sm text-secondary">
                                How can we reach you?
                            </p>
                        </div>

                        <div className="space-y-5">
                            <Input
                                title="Contact Name *"
                                value={formData.contactName}
                                onChange={(e) => {
                                    onFieldChange("contactName", e.target.value);
                                    onClearError("contactName");
                                }}
                                placeholder="John Doe"
                                error={errors.contactName}
                            />

                            <Input
                                title="Phone Number *"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                    onFieldChange("phone", e.target.value);
                                    onClearError("phone");
                                }}
                                placeholder="+1234567890"
                                error={errors.phone}
                            />

                            <Input
                                title="Address *"
                                value={formData.address}
                                onChange={(e) => {
                                    onFieldChange("address", e.target.value);
                                    onClearError("address");
                                }}
                                placeholder="Street address, City, Country"
                                error={errors.address}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-xl font-semibold text-default mb-2">
                                Additional Details
                            </h2>
                            <p className="text-sm text-secondary">
                                Tell us more about your {orgTypeName.toLowerCase()} (optional)
                            </p>
                        </div>

                        <div className="space-y-5">
                            <Input
                                title="Website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => onFieldChange("website", e.target.value)}
                                placeholder="https://example.com"
                            />

                            <TextArea
                                title="Description"
                                value={formData.description || ""}
                                onChange={(e) => onFieldChange("description", e.target.value)}
                                placeholder={`Tell us about your ${orgTypeName.toLowerCase()}...`}
                                rows={5}
                            />

                            <div className="bg-pale-primary border border-primary rounded-lg p-4">
                                <p className="text-sm text-primary">
                                    <strong>Note:</strong> These fields are optional. You can always update them later in your profile settings.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <MultiStepForm
            steps={steps}
            currentStep={currentStep}
            onStepChange={onStepChange}
        >
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-custom">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${currentStep === 0
                        ? "bg-very-pale text-muted-light cursor-not-allowed"
                        : "bg-pale text-default hover-bg-very-pale"
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Previous
                    </span>
                </button>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentStep === steps.length - 1}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${currentStep === steps.length - 1
                        ? "bg-very-pale text-muted-light cursor-not-allowed"
                        : "bg-primary hover:opacity-90 shadow-md hover:shadow-lg"
                        }`}
                >
                    <span className="flex items-center gap-2">
                        Next
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </span>
                </button>
            </div>
        </MultiStepForm>
    );
};

export default MultiStepOrganizationForm;

