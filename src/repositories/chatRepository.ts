/**
 * Repository for chat data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { ChatThreadI, ChatMessageI } from "@/src/models/chat";
import { getUseMockData } from "@/src/utils/config";

export const chatRepository = {
  /**
   * Get all chat threads for a user
   */
  getThreadsByUserId: async (
    userId: string | number
  ): Promise<ChatThreadI[]> => {
    if (getUseMockData()) {
      const mockData = await import("@/src/data/mockChatThreads.json");
      const threads = mockData.default as ChatThreadI[];
      // Convert userId to number for comparison
      const numericUserId =
        typeof userId === "string" ? parseInt(userId, 10) : userId;
      // Filter threads where user is a participant
      return threads.filter((t) => t.participantIds.includes(numericUserId));
    }
    return api.get<ChatThreadI[]>(`/api/chat/threads?userId=${userId}`);
  },

  /**
   * Get all messages for a thread
   */
  getMessagesByThreadId: async (
    threadId: string | number
  ): Promise<ChatMessageI[]> => {
    if (getUseMockData()) {
      const mockData = await import("@/src/data/mockChatMessages.json");
      const messages = mockData.default as ChatMessageI[];
      // Convert threadId to number for comparison
      const numericThreadId =
        typeof threadId === "string" ? parseInt(threadId, 10) : threadId;
      return messages.filter((m) => m.threadId === numericThreadId);
    }
    return api.get<ChatMessageI[]>(`/api/chat/threads/${threadId}/messages`);
  },

  /**
   * Send a new message
   */
  sendMessage: async (
    threadId: string | number,
    senderId: string | number,
    body: string,
    type: "TEXT" | "PROPOSAL" | "SYSTEM" = "TEXT",
    attachments?: string[],
    proposalId?: number
  ): Promise<ChatMessageI> => {
    if (getUseMockData()) {
      // Convert IDs to numbers
      const numericThreadId =
        typeof threadId === "string" ? parseInt(threadId, 10) : threadId;
      const numericSenderId =
        typeof senderId === "string" ? parseInt(senderId, 10) : senderId;
      // Simulate message creation
      return {
        id: Date.now(), // Use timestamp as numeric ID
        threadId: numericThreadId,
        senderId: numericSenderId,
        type,
        body,
        proposalId,
        attachments,
        createdAt: new Date().toISOString(),
      } as ChatMessageI;
    }
    return api.post<ChatMessageI>(`/api/chat/threads/${threadId}/messages`, {
      senderId,
      type,
      body,
      proposalId,
      attachments,
    });
  },
};
