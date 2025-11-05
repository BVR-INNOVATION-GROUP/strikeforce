/**
 * Custom hook for student chat logic
 */
import { useState, useEffect } from "react";
import { ChatThreadI } from "@/src/models/chat";
import { ChatMessageI } from "@/src/models/chat";
import { UserI } from "@/src/models/user";
import { MilestoneProposalI } from "@/src/models/milestone";
import { chatService } from "@/src/services/chatService";
import { userRepository } from "@/src/repositories/userRepository";
import { proposalRepository } from "@/src/repositories/proposalRepository";
import { milestoneProposalService } from "@/src/services/milestoneProposalService";
import { useToast } from "@/src/hooks/useToast";

export interface UseStudentChatResult {
  threads: ChatThreadI[];
  selectedThread: ChatThreadI | null;
  messages: ChatMessageI[];
  users: Record<string, UserI>;
  messageText: string;
  loading: boolean;
  proposals: Record<string, MilestoneProposalI>;
  acceptingProposalId: string | null;
  setSelectedThread: (thread: ChatThreadI | null) => void;
  setMessageText: (text: string) => void;
  handleSendMessage: () => Promise<void>;
  handleAcceptProposal: (proposalId: string) => Promise<void>;
}

/**
 * Hook for managing student chat state and logic
 */
export function useStudentChat(userId: string | undefined): UseStudentChatResult {
  const [threads, setThreads] = useState<ChatThreadI[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThreadI | null>(null);
  const [messages, setMessages] = useState<ChatMessageI[]>([]);
  const [users, setUsers] = useState<Record<string, UserI>>({});
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Record<string, MilestoneProposalI>>({});
  const [acceptingProposalId, setAcceptingProposalId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      
      try {
        const [threadsData, usersData] = await Promise.all([
          chatService.getUserThreads(userId),
          userRepository.getAll(),
        ]);

        setThreads(threadsData);

        const usersMap: Record<string, UserI> = {};
        usersData.forEach((u) => {
          usersMap[u.id] = u;
        });
        setUsers(usersMap);

        if (threadsData.length > 0) {
          const firstThread = threadsData[0];
          setSelectedThread(firstThread);
          const [threadMessages, proposalsData] = await Promise.all([
            chatService.getThreadMessages(firstThread.id),
            proposalRepository.getAll(firstThread.projectId),
          ]);
          setMessages(threadMessages);

          const proposalsMap: Record<string, MilestoneProposalI> = {};
          proposalsData.forEach((p) => {
            proposalsMap[p.id] = p;
          });
          setProposals(proposalsMap);
        }
      } catch (error) {
        console.error("Failed to load chat data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedThread) return;
      
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
      }
    };
    loadMessages();
  }, [selectedThread]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedThread || !userId) return;

    try {
      const newMessage = await chatService.sendMessage(selectedThread.id, userId, messageText);
      setMessages([...messages, newMessage]);
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
      showError("Failed to send message. Please try again.");
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    setAcceptingProposalId(proposalId);
    try {
      const updatedProposal = await milestoneProposalService.acceptProposal(proposalId);

      setProposals((prev) => ({ ...prev, [proposalId]: updatedProposal }));

      showSuccess("Proposal accepted! Waiting for partner to finalize.");

      if (selectedThread) {
        const threadMessages = await chatService.getThreadMessages(selectedThread.id);
        setMessages(threadMessages);
      }
    } catch (error: any) {
      console.error("Failed to accept proposal:", error);
      showError(error.message || "Failed to accept proposal. Please try again.");
    } finally {
      setAcceptingProposalId(null);
    }
  };

  return {
    threads,
    selectedThread,
    messages,
    users,
    messageText,
    loading,
    proposals,
    acceptingProposalId,
    setSelectedThread,
    setMessageText,
    handleSendMessage,
    handleAcceptProposal,
  };
}





