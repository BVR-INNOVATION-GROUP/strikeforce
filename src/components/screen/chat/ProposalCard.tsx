"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { MilestoneProposalI } from "@/src/models/milestone";
import { DollarSign, Calendar, CheckCircle, FileText } from "lucide-react";

export interface Props {
  proposal: MilestoneProposalI;
  userRole: "partner" | "student" | "supervisor";
  onAccept?: () => void;
  onFinalize?: () => void;
  isAccepting?: boolean;
  isFinalizing?: boolean;
}

/**
 * ProposalCard - displays milestone proposal in chat with actions
 * PRD: Shows proposal details and allows accept/finalize actions
 */
const ProposalCard = ({
  proposal,
  userRole,
  onAccept,
  onFinalize,
  isAccepting = false,
  isFinalizing = false,
}: Props) => {
  return (
    <Card className="p-8 bg-paper border-2 border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-primary" />
          <h3 className="text-[1rem] font-[600]">{proposal.title}</h3>
        </div>
        <StatusIndicator status={proposal.status.toLowerCase()} />
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-[0.8125rem] font-[600] opacity-60 mb-2">Scope</p>
          <p className="text-[0.875rem] opacity-60 leading-relaxed">{proposal.scope}</p>
        </div>

        <div>
          <p className="text-[0.8125rem] font-[600] opacity-60 mb-2">Acceptance Criteria</p>
          <p className="text-[0.875rem] opacity-60 leading-relaxed">{proposal.acceptanceCriteria}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-pale">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="opacity-60" />
            <div>
              <p className="text-[0.8125rem] opacity-60 mb-1">Due Date</p>
              <p className="text-[0.875rem] font-[600]">
                {new Date(proposal.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          {proposal.amount && proposal.amount > 0 && (
            <div className="flex items-center gap-3">
              <DollarSign size={18} className="opacity-60" />
              <div>
                <p className="text-[0.8125rem] opacity-60 mb-1">Amount</p>
                <p className="text-[0.875rem] font-[600]">${proposal.amount.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-pale">
        {userRole === "student" && proposal.status === "PROPOSED" && onAccept && (
          <Button
            onClick={onAccept}
            className="bg-primary flex-1 text-[0.875rem] py-2.5"
            disabled={isAccepting}
          >
            <CheckCircle size={18} className="mr-2" />
            {isAccepting ? "Accepting..." : "Accept Proposal"}
          </Button>
        )}
        {userRole === "partner" && proposal.status === "ACCEPTED" && onFinalize && (
          <Button
            onClick={onFinalize}
            className="bg-primary flex-1 text-[0.875rem] py-2.5"
            disabled={isFinalizing}
          >
            <CheckCircle size={18} className="mr-2" />
            {isFinalizing ? "Finalizing..." : "Finalize & Create Milestone"}
          </Button>
        )}
        {proposal.status === "FINALIZED" && (
          <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-[0.875rem] text-success-dark font-[600]">
              ✓ Proposal finalized - Milestone created
            </p>
          </div>
        )}
        {proposal.status === "ACCEPTED" && userRole === "student" && (
          <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-[0.875rem] text-info-dark font-[600]">
              ✓ Proposal accepted - Waiting for partner to finalize
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProposalCard;


