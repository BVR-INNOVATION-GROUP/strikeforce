/**
 * Project Form Step 4 - Partner Signature
 */
"use client";

import React from "react";
import SignaturePad from "@/src/components/base/SignaturePad";
import ErrorMessage from "@/src/components/core/ErrorMessage";

export interface Props {
  partnerSignature: string | null;
  errors: Record<string, string>;
  onSignatureChange: (signature: string | null) => void;
  onClearError: (field: string) => void;
}

/**
 * Step 4 of project form - partner signature
 */
const ProjectFormStep4 = ({
  partnerSignature,
  errors,
  onSignatureChange,
  onClearError,
}: Props) => {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-[1rem] font-[600] mb-2">Partner Signature</h3>
        <p className="text-[0.875rem] text-secondary mb-4">
          Please sign below to confirm your agreement to the project terms. 
          This signature will be included in the Memorandum of Understanding (MOU) 
          that will be generated when the university admin approves this project.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <SignaturePad
          onSignatureChange={(signature) => {
            onSignatureChange(signature);
            if (signature) {
              onClearError("partnerSignature");
            }
          }}
          initialSignature={partnerSignature}
          width={600}
          height={200}
          className="w-full"
        />

        {errors.partnerSignature && (
          <ErrorMessage message={errors.partnerSignature} />
        )}

        <div className="mt-4 p-4 bg-pale rounded-lg">
          <p className="text-xs text-secondary">
            <strong>Note:</strong> By signing, you acknowledge that you have read 
            and agree to the project terms. The MOU will be generated automatically 
            once the university admin approves this project and adds their signature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectFormStep4;










