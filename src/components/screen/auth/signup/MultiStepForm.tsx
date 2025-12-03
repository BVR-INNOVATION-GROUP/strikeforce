/**
 * Multi-Step Form Component with Progress Indicator
 */
"use client";

import React from "react";

export interface Step {
  id: number;
  title: string;
  description?: string;
}

export interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  children: React.ReactNode;
  onStepChange?: (step: number) => void;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  currentStep,
  children,
  onStepChange,
}) => {
  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onStepChange?.(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  index <= currentStep
                    ? "bg-primary text-white shadow-md"
                    : "bg-paper text-[var(--text-secondary)] border border-custom"
                } ${onStepChange ? "cursor-pointer" : "cursor-default"}`}
                disabled={!onStepChange}
              >
                {index + 1}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 rounded-full ${
                    index < currentStep
                      ? "bg-primary"
                      : "bg-[var(--border)]"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">{children}</div>
    </div>
  );
};

