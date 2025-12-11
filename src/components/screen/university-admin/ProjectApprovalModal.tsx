/**
 * Project Approval Modal with Signature
 * Allows university admin to add signature when approving a project
 */
"use client";

import React, { useState } from "react";
import Modal from "@/src/components/base/Modal";
import SignaturePad from "@/src/components/base/SignaturePad";
import Button from "@/src/components/core/Button";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { CheckCircle } from "lucide-react";
import { generateMOUPDF } from "@/src/utils/generateMOU";
import { uploadToCloudinary } from "@/src/utils/cloudinaryUpload";
import { ProjectI } from "@/src/models/project";

export interface Props {
  open: boolean;
  onClose: () => void;
  onApprove: (signature: string, mouUrl: string) => Promise<void>;
  project: ProjectI;
  universityAdminName?: string;
  isProcessing?: boolean;
}

const ProjectApprovalModal: React.FC<Props> = ({
  open,
  onClose,
  onApprove,
  project,
  universityAdminName,
  isProcessing = false,
}) => {
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleApprove = async () => {
    if (!signature) {
      setError("Please provide your signature before approving");
      return;
    }

    if (!project.partnerSignature) {
      setError("Partner signature is missing. Cannot generate MOU.");
      return;
    }

    setError(null);
    setIsGeneratingPDF(true);

    try {
      // Generate MOU PDF
      const mouData = {
        projectTitle: project.title,
        universityName: project.department?.organization?.name || project.department?.collegeName,
        departmentName: project.department?.name,
        courseName: project.course?.name,
        summary: project.summary,
        challengeStatement: project.challengeStatement,
        scopeActivities: project.scopeActivities,
        expectations: project.expectations,
        skills: project.skills || [],
        budget: typeof project.budget === "object" && project.budget !== null
          ? {
              currency: (project.budget as any).currency || project.currency || "UGX",
              value: (project.budget as any).value || (project.budget as any).Value || 0,
            }
          : undefined,
        deadline: project.deadline,
        partnerName: (project as any).user?.name || (project as any).partner?.name,
        partnerSignature: project.partnerSignature,
        universityAdminName: universityAdminName,
        universityAdminSignature: signature,
      };

      const pdfBlob = await generateMOUPDF(mouData);

      // Upload PDF to Cloudinary
      // Note: Cloudinary requires PDF delivery to be enabled in Security settings
      // Go to Settings > Security > Enable "Allow delivery of PDF and ZIP files"
      const pdfFile = new File([pdfBlob], `mou-project-${project.id}.pdf`, {
        type: "application/pdf",
      });

      const mouUrl = await uploadToCloudinary(pdfFile, {
        folder: `strikeforce/projects/${project.id}/mou`,
        resourceType: "raw",
      });

      // Approve with signature and MOU URL
      await onApprove(signature, mouUrl);
      
      // Reset signature on success
      setSignature(null);
    } catch (err) {
      console.error("Failed to generate MOU:", err);
      setError(err instanceof Error ? err.message : "Failed to generate MOU and approve project");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleClose = () => {
    setSignature(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Approve Project"
      actions={[
        <Button
          key="cancel"
          onClick={handleClose}
          className="bg-pale text-primary"
          disabled={isProcessing}
        >
          Cancel
        </Button>,
        <Button
          key="approve"
          onClick={handleApprove}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isProcessing || isGeneratingPDF || !signature}
        >
          <CheckCircle size={16} className="mr-2" />
          {isGeneratingPDF 
            ? "Generating MOU..." 
            : isProcessing 
            ? "Approving..." 
            : "Approve & Generate MOU"}
        </Button>,
      ]}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[0.875rem] text-secondary mb-4">
            Please sign below to approve this project. Once approved, a Memorandum of Understanding (MOU) 
            will be automatically generated with both your signature and the partner's signature, 
            and saved to Cloudinary.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Your Signature</h4>
          <SignaturePad
            onSignatureChange={(sig) => {
              setSignature(sig);
              if (sig) {
                setError(null);
              }
            }}
            initialSignature={null}
            width={600}
            height={200}
            className="w-full"
          />

          {error && <ErrorMessage message={error} className="mt-2" />}
        </div>

        <div className="p-4 bg-pale rounded-lg">
          <p className="text-xs text-secondary">
            <strong>Note:</strong> By signing and approving, you acknowledge that you have reviewed 
            the project and agree to the terms. The MOU will be generated automatically and associated 
            with this project.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectApprovalModal;

