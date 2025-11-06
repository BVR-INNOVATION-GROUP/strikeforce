/**
 * Chat model - represents project chat threads and messages
 */
export type ChatThreadType = "PROJECT" | "DM";
export type MessageType = "TEXT" | "PROPOSAL" | "SYSTEM";

export interface ChatThreadI {
  id: number;
  projectId: number; // Project ID (numeric)
  type: ChatThreadType;
  participantIds: number[]; // User IDs (numeric)
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageI {
  id: number;
  threadId: number;
  senderId: number;
  type: MessageType;
  body: string;
  proposalId?: number; // If type is PROPOSAL (numeric milestone proposal ID)
  attachments?: string[];
  createdAt: string;
}





