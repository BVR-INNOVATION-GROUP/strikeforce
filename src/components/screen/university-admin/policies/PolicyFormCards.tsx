/**
 * Policy Form Cards Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Input from "@/src/components/core/Input";
import Select from "@/src/components/core/Select";
import { PolicyFormData, ValidationErrors } from "@/src/utils/policyValidation";

export interface Props {
  policies: PolicyFormData;
  errors: ValidationErrors;
  onChange: (field: keyof PolicyFormData, value: string | number) => void;
  onClearError: (field: string) => void;
}

/**
 * Policy form cards
 */
const PolicyFormCards = ({
  policies,
  errors,
  onChange,
  onClearError,
}: Props) => {
  return (
    <>
      {/* Supervisor Capacity */}
      <Card title="Supervisor Capacity">
        <div className="space-y-4">
          <Input
            title="Maximum Active Projects per Supervisor *"
            type="number"
            value={policies.supervisorMaxActive.toString()}
            onChange={(e) => {
              onChange(
                "supervisorMaxActive",
                parseInt(e.target.value) || 0
              );
              onClearError("supervisorMaxActive");
            }}
            min="1"
            max="50"
            error={errors.supervisorMaxActive}
          />
          <p className="text-sm text-secondary">
            Set the maximum number of active projects a supervisor can oversee
            simultaneously.
          </p>
        </div>
      </Card>

      {/* Payout Routing */}
      <Card title="Payout Routing">
        <div className="space-y-4">
          <Select
            title="Default Payout Routing"
            options={[
              { value: "STUDENT", label: "Direct to Students" },
              { value: "UNIVERSITY", label: "Through University Account" },
            ]}
            value={policies.payoutRouting}
            onChange={(option) =>
              onChange(
                "payoutRouting",
                typeof option === "string" ? option : (option.value as string)
              )
            }
            placeHolder="Select routing"
          />
          <p className="text-sm text-secondary">
            Choose whether milestone payments go directly to students or are
            routed through the university account.
          </p>
        </div>
      </Card>

      {/* Screening Policies */}
      <Card title="Screening Policies">
        <div className="space-y-4">
          <Input
            title="Auto-Shortlist Threshold Score *"
            type="number"
            value={policies.autoShortlistThreshold.toString()}
            onChange={(e) => {
              onChange(
                "autoShortlistThreshold",
                parseInt(e.target.value) || 0
              );
              onClearError("autoShortlistThreshold");
            }}
            min="0"
            max="100"
            error={errors.autoShortlistThreshold}
          />
          <p className="text-sm text-secondary">
            Applications with scores above this threshold will be automatically
            shortlisted.
          </p>
        </div>
      </Card>

      {/* Offer Settings */}
      <Card title="Offer Settings">
        <div className="space-y-4">
          <Input
            title="Offer Expiry (Days) *"
            type="number"
            value={policies.offerExpiryDays.toString()}
            onChange={(e) => {
              onChange("offerExpiryDays", parseInt(e.target.value) || 0);
              onClearError("offerExpiryDays");
            }}
            min="1"
            max="30"
            error={errors.offerExpiryDays}
          />
          <p className="text-sm text-secondary">
            Number of days before an offer expires if not accepted.
          </p>
        </div>
      </Card>
    </>
  );
};

export default PolicyFormCards;








