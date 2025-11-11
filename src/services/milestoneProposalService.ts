/**
 * Milestone Proposal Service - business logic for milestone proposals in chat
 * PRD Reference: Section 7 - Project Chat and Milestone Negotiation
 */
import { MilestoneProposalI, MilestoneI, MilestoneStatus } from '@/src/models/milestone';
import { proposalRepository } from '@/src/repositories/proposalRepository';
import { milestoneRepository } from '@/src/repositories/milestoneRepository';

/**
 * Business logic layer for milestone proposal operations
 */
export const milestoneProposalService = {
  /**
   * Create a new milestone proposal
   * @param proposalData - Proposal data
   * @returns Created proposal
   */
  createProposal: async (proposalData: Partial<MilestoneProposalI>): Promise<MilestoneProposalI> => {
    // Business validation
    if (!proposalData.projectId) {
      throw new Error("Project ID is required");
    }

    if (!proposalData.proposerId) {
      throw new Error("Proposer ID is required");
    }

    if (!proposalData.title || proposalData.title.trim().length < 3) {
      throw new Error("Proposal title must be at least 3 characters");
    }

    if (!proposalData.scope || proposalData.scope.trim().length < 10) {
      throw new Error("Scope must be at least 10 characters");
    }

    if (!proposalData.acceptanceCriteria || proposalData.acceptanceCriteria.trim().length < 10) {
      throw new Error("Acceptance criteria must be at least 10 characters");
    }

    if (!proposalData.dueDate) {
      throw new Error("Due date is required");
    }

    // Validate due date is in future
    const dueDate = new Date(proposalData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      throw new Error("Due date must be in the future");
    }

    // Create proposal
    const newProposal: Partial<MilestoneProposalI> = {
      projectId: proposalData.projectId,
      proposerId: proposalData.proposerId || "",
      title: proposalData.title.trim(),
      scope: proposalData.scope.trim(),
      acceptanceCriteria: proposalData.acceptanceCriteria.trim(),
      dueDate: new Date(proposalData.dueDate).toISOString(),
      amount: proposalData.amount,
      status: "PROPOSED" as MilestoneStatus,
    };

    // Save to repository
    return proposalRepository.create(newProposal);
  },

  /**
   * Accept a proposal (students can accept)
   * PRD: Students accept proposal → status changes to ACCEPTED
   * @param proposalId - Proposal ID
   * @returns Updated proposal
   */
  acceptProposal: async (proposalId: string): Promise<MilestoneProposalI> => {
    const proposal = await proposalRepository.getById(proposalId);
    
    // Business rule: Only PROPOSED proposals can be accepted
    if (proposal.status !== "PROPOSED") {
      throw new Error(`Cannot accept proposal with status ${proposal.status}`);
    }

    // Update proposal status to ACCEPTED
    return proposalRepository.update(proposalId, {
      status: "ACCEPTED" as MilestoneStatus,
    });
  },

  /**
   * Finalize a proposal (partner only - creates milestone)
   * PRD: Partner finalizes → system creates Milestone
   * @param proposalId - Proposal ID
   * @param proposerId - ID of partner finalizing (for authorization check)
   * @returns Created milestone
   */
  finalizeProposal: async (
    proposalId: string,
    proposerId: string
  ): Promise<MilestoneI> => {
    const proposal = await proposalRepository.getById(proposalId);
    
    // Business rule: Only ACCEPTED proposals can be finalized
    if (proposal.status !== "ACCEPTED") {
      throw new Error(
        `Cannot finalize proposal. Proposal must be accepted by students first. Current status: ${proposal.status}`
      );
    }

    // Business rule: Proposal must have an amount to be finalized
    if (!proposal.amount || proposal.amount <= 0) {
      throw new Error("Proposal must have a valid amount to be finalized");
    }

    // Create milestone from proposal
    const milestone = await milestoneRepository.create({
      projectId: proposal.projectId,
      title: proposal.title,
      scope: proposal.scope,
      acceptanceCriteria: proposal.acceptanceCriteria,
      dueDate: proposal.dueDate,
      amount: proposal.amount,
      escrowStatus: "PENDING", // Escrow needs to be funded separately
      supervisorGate: false,
      status: "FINALIZED" as MilestoneStatus,
    });

    // Update proposal status to FINALIZED
    await proposalRepository.update(proposalId, {
      status: "FINALIZED" as MilestoneStatus,
    });

    return milestone;
  },
};

