/**
 * Application Form Fields Component
 */
"use client";

import React from "react";
import Select from "@/src/components/core/Select";
import Radio from "@/src/components/core/Radio";
import TextArea from "@/src/components/core/TextArea";
import ErrorMessage from "@/src/components/core/ErrorMessage";
import { ApplicationType } from "@/src/models/application";
import { GroupI } from "@/src/models/group";
import Link from "next/link";

export interface Props {
  applicantType: ApplicationType;
  selectedGroupId: string;
  statement: string;
  availableGroups: GroupI[];
  errors: Record<string, string>;
  onApplicantTypeChange: (type: ApplicationType) => void;
  onGroupChange: (groupId: string) => void;
  onStatementChange: (value: string) => void;
  onClearError: (field: string) => void;
}

/**
 * Form fields for application form
 */
const ApplicationFormFields = ({
  applicantType,
  selectedGroupId,
  statement,
  availableGroups,
  errors,
  onApplicantTypeChange,
  onGroupChange,
  onStatementChange,
  onClearError,
}: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-[12px]">Apply As *</p>
        <div className="flex flex-col gap-3">
          <Radio
            name="applicantType"
            value="INDIVIDUAL"
            checked={applicantType === "INDIVIDUAL"}
            onChange={(e) => {
              onApplicantTypeChange(e.target.value as ApplicationType);
              onClearError("applicantType");
            }}
            label="Individual"
          />
          <Radio
            name="applicantType"
            value="GROUP"
            checked={applicantType === "GROUP"}
            onChange={(e) => {
              onApplicantTypeChange(e.target.value as ApplicationType);
              onClearError("applicantType");
            }}
            label="Group"
          />
        </div>
        {errors.applicantType && <ErrorMessage message={errors.applicantType} />}
      </div>

      {applicantType === "GROUP" && (
        <div>
          {availableGroups.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-warning-dark">
                You need to be a member or leader of a group to apply as a group.
                <Link href="/student/groups" className="underline ml-1">
                  Create or join a group first.
                </Link>
              </p>
            </div>
          ) : (
            <Select
              title="Select Group *"
              options={availableGroups.map((g) => ({
                value: g.id.toString(),
                label: `${g.name} (${g.memberIds.length}/${g.capacity} members)`,
              }))}
              value={selectedGroupId || null}
              onChange={(option) => {
                const groupId =
                  typeof option === "string" ? option : (option?.value?.toString() || "");
                onGroupChange(groupId);
              }}
              placeHolder="Choose a group"
              error={errors.group}
            />
          )}
        </div>
      )}

      <TextArea
        title="Application Statement *"
        value={statement}
        onChange={(e) => {
          onStatementChange(e.target.value);
        }}
        placeholder="Describe why you/your group are suitable for this project. Include relevant experience, skills, and approach..."
        rows={8}
        error={errors.statement}
      />
    </div>
  );
};

export default ApplicationFormFields;




