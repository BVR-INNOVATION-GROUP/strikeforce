/**
 * Custom hook for chat handlers
 */
import { useState, useEffect } from "react";
import { ChatThreadI, ChatMessageI } from "@/src/models/chat";
import { UserI } from "@/src/models/user";
import { MilestoneProposalI } from "@/src/models/milestone";
import { chatService } from "@/src/services/chatService";
import { userRepository } from "@/src/repositories/userRepository";
import { milestoneProposalService } from "@/src/services/milestoneProposalService";
import { proposalRepository } from "@/src/repositories/proposalRepository";

export interface UseChatHandlersParams {
  userId: string | undefined;
  selectedThread: ChatThreadI | null;
}

export interface UseChatHandlersResult {
  messages: ChatMessageI[];
  users: Record<string, UserI>;
  proposals: Record<string, MilestoneProposalI>;
  loading: boolean;
  handleSendMessage: (messageText: string, threads: ChatThreadI[], setThreads: (threads: ChatThreadI[]) => void) => Promise<void>;
  handleProposalSubmit: (proposalData: Partial<MilestoneProposalI>) => Promise<void>;
  handleFinalizeProposal: (proposalId: string) => Promise<void>;
  finalizingProposalId: string | null;
  refreshMessages: () => Promise<void>;
}

/**
 * Hook for managing chat handlers and state
 */
export function useChatHandlers({
  userId,
  selectedThread,
}: UseChatHandlersParams): UseChatHandlersResult {
  const [messages, setMessages] = useState<ChatMessageI[]>([]);
  const [users, setUsers] = useState<Record<string, UserI>>({});
  const [proposals, setProposals] = useState<Record<string, MilestoneProposalI>>({});
  const [loading, setLoading] = useState(true);
  const [finalizingProposalId, setFinalizingProposalId] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await userRepository.getAll();
        const usersMap: Record<string, UserI> = {};
        usersData.forEach((u) => {
          usersMap[u.id] = u;
        });
        setUsers(usersMap);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };
    loadUsers();
  }, []);

  const refreshMessages = async () => {
    if (selectedThread) {
      try {
        const [threadMessages, proposalsData] = await Promise.all([
          chatService.getThreadMessages(selectedThread.id),
          proposalRepository.getAll(selectedThread.projectId),
        ]);
        setMessages(threadMessages);
        
        const proposalsMap: Record<string, MilestoneProposalI> = {};
        proposalsData.forEach((p) => {
          proposalsMap[p.id] = p;
        });
        setProposals(proposalsMap);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMessages();
  }, [selectedThread]);

  const handleSendMessage = async (
    messageText: string,
    threads: ChatThreadI[],
    setThreads: (threads: ChatThreadI[]) => void
  ) => {
    if (!messageText.trim() || !selectedThread || !userId) return;

    try {
      const newMessage = await chatService.sendMessage(
        selectedThread.id,
        userId,
        messageText
      );
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  const handleProposalSubmit = async (proposalData: Partial<MilestoneProposalI>) => {
    if (!selectedThread || !userId) {
      throw new Error("Please select a conversation first");
    }

    const proposal = await milestoneProposalService.createProposal({
      ...proposalData,
      projectId: selectedThread.projectId || "",
    });

    const proposalMessage = await chatService.sendMessage(
      selectedThread.id,
      userId,
      `Milestone Proposal: ${proposal.title}`,
      "PROPOSAL",
      undefined,
      proposal.id
    );

    setProposals((prev) => ({ ...prev, [proposal.id]: proposal }));
    setMessages([...messages, proposalMessage]);
  };

  const handleFinalizeProposal = async (proposalId: string) => {
    if (!userId) {
      throw new Error("User not logged in");
    }

    setFinalizingProposalId(proposalId);
    try {
      await milestoneProposalService.finalizeProposal(proposalId, userId);
      const updatedProposal = await proposalRepository.getById(proposalId);
      setProposals((prev) => ({ ...prev, [proposalId]: updatedProposal }));
      
      if (selectedThread) {
        const threadMessages = await chatService.getThreadMessages(selectedThread.id);
        setMessages(threadMessages);
      }
    } finally {
      setFinalizingProposalId(null);
    }
  };

  return {
    messages,
    users,
    proposals,
    loading,
    handleSendMessage,
    handleProposalSubmit,
    handleFinalizeProposal,
    finalizingProposalId,
    refreshMessages,
  };
}






