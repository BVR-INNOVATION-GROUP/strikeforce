/**
 * Repository for chat data operations
 * Connects to backend API
 */
import { api } from "@/src/api/client";
import { ChatThreadI, ChatMessageI } from "@/src/models/chat";

/**
 * Normalize a chat message from backend format to frontend format
 * Backend uses GORM which may return uppercase field names (CreatedAt, etc.)
 * Frontend expects lowercase (createdAt, etc.)
 */
function normalizeChatMessage(message: any): ChatMessageI {
  if (!message) {
    throw new Error("Cannot normalize null or undefined message");
  }

  // Handle both CreatedAt (GORM default) and createdAt (JSON tag)
  // GORM returns time.Time which gets serialized as RFC3339 string
  const createdAt = message.createdAt || message.CreatedAt || "";

  // Ensure createdAt is a valid string
  let normalizedCreatedAt = "";
  if (createdAt) {
    // If it's already a string, use it
    if (typeof createdAt === "string") {
      normalizedCreatedAt = createdAt;
    } else if (createdAt instanceof Date) {
      // If it's a Date object, convert to ISO string
      normalizedCreatedAt = createdAt.toISOString();
    } else {
      // Try to convert to string
      normalizedCreatedAt = String(createdAt);
    }
  }

  return {
    id:
      message.ID !== undefined
        ? message.ID
        : message.id !== undefined
        ? message.id
        : message.Id,
    threadId: message.threadId || message.ThreadID || message.thread_id,
    senderId: message.senderId || message.SenderID || message.sender_id,
    sender: message.sender || message.Sender,
    type: message.type || message.Type || "TEXT",
    body: message.body || message.Body || "",
    proposalId: message.proposalId || message.ProposalID || message.proposal_id,
    attachments: message.attachments || message.Attachments || [],
    createdAt: normalizedCreatedAt,
  };
}

export const chatRepository = {
  /**
   * Get all messages for a group
   * Backend endpoint: GET /api/v1/chats/:group
   */
  getMessagesByGroupId: async (
    groupId: string | number
  ): Promise<ChatMessageI[]> => {
    const messages = await api.get<any[]>(`/api/v1/chats/${groupId}`);
    return messages.map(normalizeChatMessage);
  },

  /**
   * Get all messages for a project
   * Backend endpoint: GET /api/v1/chats/project/:projectId
   * Finds ASSIGNED application, gets group ID, then fetches messages
   */
  getMessagesByProjectId: async (
    projectId: string | number
  ): Promise<ChatMessageI[]> => {
    const messages = await api.get<any[]>(`/api/v1/chats/project/${projectId}`);
    return messages.map(normalizeChatMessage);
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
    const messages = await api.get<any[]>(
      `/api/v1/chats/threads/${threadId}/messages`
    );
    return messages.map(normalizeChatMessage);
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

    const message = await api.post<any>(`/api/v1/chats`, {
      group_id: numericGroupId,
      type,
      body,
      proposalId,
      attachments,
    });
    return normalizeChatMessage(message);
  },
};
