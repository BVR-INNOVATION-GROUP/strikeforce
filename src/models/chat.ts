/**
 * Chat model - represents project chat threads and messages
 */
export type ChatThreadType = "PROJECT" | "DM";
export type MessageType = "TEXT" | "PROPOSAL" | "SYSTEM";

export interface ChatThreadI {
  id: string;
  projectId: string;
  type: ChatThreadType;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageI {
  id: string;
  threadId: string;
  senderId: string;
  type: MessageType;
  body: string;
  proposalId?: string; // If type is PROPOSAL
  attachments?: string[];
  createdAt: string;
}





