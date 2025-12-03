/**
 * Repository for chat data operations
 * Connects to backend API
 */
import { api } from "@/src/api/client";
import { ChatThreadI, ChatMessageI } from "@/src/models/chat";

export const chatRepository = {
  /**
   * Get all messages for a group
   * Backend endpoint: GET /api/v1/chats/:group
   */
  getMessagesByGroupId: async (
    groupId: string | number
  ): Promise<ChatMessageI[]> => {
    return api.get<ChatMessageI[]>(`/api/v1/chats/${groupId}`);
  },

  /**
   * Get all chat threads for the authenticated user
   * Backend uses JWT token's user_id - never pass userId in request
   */
  getThreadsByUserId: async (): Promise<ChatThreadI[]> => {
    return api.get<ChatThreadI[]>(`/api/v1/chats/threads`);
  },

  /**
   * Get all messages for a thread
   * Note: Backend may need to add this endpoint if not available
   */
  getMessagesByThreadId: async (
    threadId: string | number
  ): Promise<ChatMessageI[]> => {
    return api.get<ChatMessageI[]>(
      `/api/v1/chats/threads/${threadId}/messages`
    );
  },

  /**
   * Send a new message
   * Backend endpoint: POST /api/v1/chats
   * Note: Backend uses group_id, not threadId
   */
  sendMessage: async (
    groupId: string | number,
    body: string,
    type: "TEXT" | "PROPOSAL" | "SYSTEM" = "TEXT",
    attachments?: string[],
    proposalId?: number
  ): Promise<ChatMessageI> => {
    // Convert to number if string
    const numericGroupId =
      typeof groupId === "string" ? parseInt(groupId, 10) : groupId;
    if (isNaN(numericGroupId)) {
      throw new Error("Invalid group ID");
    }

    return api.post<ChatMessageI>(`/api/v1/chats`, {
      group_id: numericGroupId,
      type,
      body,
      proposalId,
      attachments,
    });
  },
};
