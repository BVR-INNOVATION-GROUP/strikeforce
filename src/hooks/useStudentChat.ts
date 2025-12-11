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
export function useStudentChat(
  userId: string | undefined
): UseStudentChatResult {
  const [threads, setThreads] = useState<ChatThreadI[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThreadI | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessageI[]>([]);
  const [users, setUsers] = useState<Record<string, UserI>>({});
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<
    Record<string, MilestoneProposalI>
  >({});
  const [acceptingProposalId, setAcceptingProposalId] = useState<string | null>(
    null
  );
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;

      try {
        // Load threads and users separately to handle errors gracefully
        let threadsData: ChatThreadI[] = [];
        let usersMap: Record<string, UserI> = {};

        try {
          threadsData = await chatService.getUserThreads();
          setThreads(threadsData);
        } catch (threadError) {
          console.warn("Failed to load chat threads:", threadError);
          setThreads([]);
          // Continue - user can still use chat if threads load later
        }

        try {
          const usersData = await userRepository.getAll();
          usersData.forEach((u) => {
            // Store with both string and number keys for compatibility
            const idStr = String(u.id);
            usersMap[idStr] = u;
            usersMap[u.id] = u;
          });
          setUsers(usersMap);
        } catch (userError) {
          console.warn("Failed to load users for chat:", userError);
          setUsers({});
          // Continue - messages will show IDs instead of names
        }

        if (threadsData.length > 0) {
          const firstThread = threadsData[0];
          setSelectedThread(firstThread);
          try {
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
          } catch (messageError) {
            console.warn("Failed to load messages or proposals:", messageError);
            setMessages([]);
            setProposals({});
            // Continue - user can still select thread
          }
        }
      } catch (error) {
        console.error("Unexpected error loading chat data:", error);
        // Set empty states so UI doesn't break
        setThreads([]);
        setUsers({});
        setMessages([]);
        setProposals({});
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedThread) {
        setMessages([]);
        return;
      }

      try {
        const [threadMessages, proposalsData] = await Promise.all([
          chatService.getThreadMessages(selectedThread.id),
          proposalRepository.getAll(selectedThread.projectId),
        ]);

        // Extract senders from messages and add to users map
        const updatedUsersMap = { ...users };
        threadMessages.forEach((msg) => {
          if (msg.sender) {
            const idStr = String(msg.sender.id);
            updatedUsersMap[idStr] = msg.sender;
            updatedUsersMap[msg.sender.id] = msg.sender;
          }
        });
        if (Object.keys(updatedUsersMap).length > Object.keys(users).length) {
          setUsers(updatedUsersMap);
        }

        setMessages(threadMessages);

        const proposalsMap: Record<string, MilestoneProposalI> = {};
        proposalsData.forEach((p) => {
          proposalsMap[p.id] = p;
        });
        setProposals(proposalsMap);
      } catch (error) {
        console.warn("Failed to load messages:", error);
        setMessages([]);
        setProposals({});
        // Don't show error to user - they can retry by selecting thread again
      }
    };
    loadMessages();
  }, [selectedThread]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedThread || !userId) return;

    try {
      const newMessage = await chatService.sendMessage(
        selectedThread.id,
        userId,
        messageText
      );
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
      const updatedProposal = await milestoneProposalService.acceptProposal(
        proposalId
      );

      setProposals((prev) => ({ ...prev, [proposalId]: updatedProposal }));

      showSuccess("Proposal accepted! Waiting for partner to finalize.");

      if (selectedThread) {
        const threadMessages = await chatService.getThreadMessages(
          selectedThread.id
        );
        setMessages(threadMessages);
      }
    } catch (error: unknown) {
      console.error("Failed to accept proposal:", error);
      showError(
        error.message || "Failed to accept proposal. Please try again."
      );
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
