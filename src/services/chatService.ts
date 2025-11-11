/**
 * Service layer for chat business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import { chatRepository } from "@/src/repositories/chatRepository";
import { ChatThreadI, ChatMessageI } from "@/src/models/chat";

export const chatService = {
  /**
   * Get all threads for a user, sorted by most recent message
   */
  getUserThreads: async (userId: string): Promise<ChatThreadI[]> => {
    return chatRepository.getThreadsByUserId(userId);
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
   * Send a message with validation
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

    return chatRepository.sendMessage(threadId, senderId, body.trim(), type, attachments, proposalId);
  },
};

