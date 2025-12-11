/**
 * Service layer for chat business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import { chatRepository } from "@/src/repositories/chatRepository";
import { ChatThreadI, ChatMessageI } from "@/src/models/chat";

export const chatService = {
  /**
   * Get all threads for the authenticated user, sorted by most recent message
   * Backend uses JWT token's user_id - never pass userId parameter
   */
  getUserThreads: async (): Promise<ChatThreadI[]> => {
    return chatRepository.getThreadsByUserId();
  },

  /**
   * Get messages for a thread, sorted by creation date
   */
  getThreadMessages: async (threadId: string): Promise<ChatMessageI[]> => {
    const messages = await chatRepository.getMessagesByThreadId(threadId);
    // Sort by creation date (oldest first)
    return messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  },

  /**
   * Get messages for a project
   * Finds ASSIGNED application, gets group ID, then fetches messages
   */
  getProjectMessages: async (
    projectId: string | number
  ): Promise<ChatMessageI[]> => {
    const messages = await chatRepository.getMessagesByProjectId(projectId);
    // Sort by creation date (oldest first)
    return messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  },

  /**
   * Send a message with validation
   * Note: threadId can be a thread ID or a group ID (backend uses group IDs)
   * Note: senderId parameter is kept for API compatibility but backend gets it from JWT token
   */
  sendMessage: async (
    threadId: string,
    senderId: string,
    body: string,
    type: "TEXT" | "PROPOSAL" | "SYSTEM" = "TEXT",
    attachments?: string[],
    proposalId?: string
  ): Promise<ChatMessageI> => {
    // Business validation
    if (!body || body.trim().length === 0) {
      throw new Error("Message body cannot be empty");
    }

    if (body.length > 5000) {
      throw new Error("Message body cannot exceed 5000 characters");
    }

    // Backend expects group_id, so threadId is used as groupId
    // Note: senderId is not passed to repository - backend gets it from JWT token
    return chatRepository.sendMessage(
      threadId,
      body.trim(),
      type,
      attachments,
      proposalId ? parseInt(proposalId, 10) : undefined
    );
  },
};
