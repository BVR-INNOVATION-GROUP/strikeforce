/**
 * ScoreApplicationModal - modal for scoring/updating application scores
 */
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import Input from "@/src/components/core/Input";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";

export interface Props {
  open: boolean;
  application: ApplicationI | null;
  project: ProjectI | undefined;
  onClose: () => void;
  onSubmit: (applicationId: string, score: number) => void;
}

/**
 * Modal for scoring applications
 */
const ScoreApplicationModal = ({
  open,
  application,
  project,
  onClose,
  onSubmit,
}: Props) => {
  const [score, setScore] = useState<string>("");
  const [errors, setErrors] = useState<{ score?: string }>({});

  // Initialize score when application changes
  useEffect(() => {
    if (application && open) {
      // setScore(
      //   application.score?.manualSupervisorScore?.toString() ||
      //     application.score?.finalScore?.toString() ||
      //     ""
      // );
      // setErrors({});
    }
  }, [application, open]);

  /**
   * Validate score input
   */
  const validate = (): boolean => {
    const newErrors: { score?: string } = {};
    const scoreNum = parseInt(score, 10);

    if (!score || score.trim() === "") {
      newErrors.score = "Score is required";
    } else if (isNaN(scoreNum)) {
      newErrors.score = "Score must be a number";
    } else if (scoreNum < 0 || scoreNum > 100) {
      newErrors.score = "Score must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (!validate() || !application) {
      return;
    }

    const scoreNum = parseInt(score, 10);
    onSubmit(application.id.toString(), scoreNum);
    onClose();
  };

  if (!application) {
    return null;
  }

  const currentScore = application.score?.finalScore;
  const autoScore = application.score?.autoScore;

  return (
    <Modal
      title={`Score Application${project ? ` - ${project.title}` : ""}`}
      open={open}
      handleClose={onClose}
      actions={[
        <Button key="cancel" onClick={onClose} className="bg-pale text-primary">
          Cancel
        </Button>,
        <Button key="submit" onClick={handleSubmit} className="bg-primary">
          {currentScore ? "Update Score" : "Save Score"}
        </Button>,
      ]}
    >
      <div className="flex flex-col gap-6">
        {/* Current Score Info */}
        {application.score && (
          <div className="p-4 bg-pale rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.875rem] opacity-60">Current Final Score</span>
              <span className="text-[1rem] font-[600]">{currentScore}</span>
            </div>
            {autoScore !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-[0.875rem] opacity-60">Auto Score</span>
                <span className="text-[0.875rem]">{autoScore}</span>
              </div>
            )}
          </div>
        )}

        {/* Score Input */}
        <div>
          <Input
            title="Manual Score *"
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => {
              setScore(e.target.value);
              if (errors.score) {
                setErrors({ ...errors, score: undefined });
              }
            }}
            placeholder="Enter score (0-100)"
            error={errors.score}
          />
          <p className="text-[0.8125rem] opacity-60 mt-2">
            Enter a score between 0 and 100. This will be used as the final score
            for this application.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ScoreApplicationModal;


