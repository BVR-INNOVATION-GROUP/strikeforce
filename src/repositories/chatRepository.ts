/**
 * Repository for chat data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { ChatThreadI, ChatMessageI } from "@/src/models/chat";

// Environment configuration
// Default to mock data in development mode
// Can be disabled by setting NEXT_PUBLIC_USE_MOCK=false
const isDevelopment = process.env.NODE_ENV === "development";
const USE_MOCK_DATA =
  isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const chatRepository = {
  /**
   * Get all chat threads for a user
   */
  getThreadsByUserId: async (userId: string): Promise<ChatThreadI[]> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockChatThreads.json");
      const threads = mockData.default as ChatThreadI[];
      // Filter threads where user is a participant
      return threads.filter((t) => t.participantIds.includes(userId));
    }
    return api.get<ChatThreadI[]>(`/api/chat/threads?userId=${userId}`);
  },

  /**
   * Get all messages for a thread
   */
  getMessagesByThreadId: async (threadId: string): Promise<ChatMessageI[]> => {
    if (USE_MOCK_DATA) {
      const mockData = await import("@/src/data/mockChatMessages.json");
      const messages = mockData.default as ChatMessageI[];
      return messages.filter((m) => m.threadId === threadId);
    }
    return api.get<ChatMessageI[]>(`/api/chat/threads/${threadId}/messages`);
  },

  /**
   * Send a new message
   */
  sendMessage: async (
    threadId: string,
    senderId: string,
    body: string,
    type: "TEXT" | "PROPOSAL" | "SYSTEM" = "TEXT",
    attachments?: string[],
    proposalId?: string
  ): Promise<ChatMessageI> => {
    if (USE_MOCK_DATA) {
      // Simulate message creation
      return {
        id: `msg-${Date.now()}`,
        threadId,
        senderId,
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
