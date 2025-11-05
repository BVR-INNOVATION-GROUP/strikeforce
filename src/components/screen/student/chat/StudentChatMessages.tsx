/**
 * Student Chat Messages Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import ChatMessage from "@/src/components/base/ChatMessage";
import Button from "@/src/components/core/Button";
import { ChatThreadI, ChatMessageI } from "@/src/models/chat";
import { UserI } from "@/src/models/user";
import { MilestoneProposalI } from "@/src/models/milestone";
import { Send } from "lucide-react";
import ProposalCard from "@/src/components/screen/chat/ProposalCard";

export interface Props {
  thread: ChatThreadI | null;
  messages: ChatMessageI[];
  users: Record<string, UserI>;
  proposals: Record<string, MilestoneProposalI>;
  currentUserId: string;
  messageText: string;
  acceptingProposalId: string | null;
  onMessageChange: (text: string) => void;
  onSendMessage: () => Promise<void>;
  onAcceptProposal: (proposalId: string) => Promise<void>;
}

/**
 * Display chat messages and input for student chat
 */
const StudentChatMessages = ({
  thread,
  messages,
  users,
  proposals,
  currentUserId,
  messageText,
  acceptingProposalId,
  onMessageChange,
  onSendMessage,
  onAcceptProposal,
}: Props) => {
  if (!thread) {
    return (
      <Card className="lg:col-span-2 flex flex-col h-[600px]">
        <div className="flex items-center justify-center h-full text-muted">
          Select a conversation to start chatting
        </div>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4">
        {messages.map((message) => {
          const sender = users[message.senderId];
          if (!sender) return null;

          // Show ProposalCard for PROPOSAL type messages
          if (
            message.type === "PROPOSAL" &&
            message.proposalId &&
            proposals[message.proposalId]
          ) {
            return (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-[80%]">
                  <div className="mb-2 text-xs text-muted flex items-center gap-2">
                    <span>{sender.name}</span>
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <ProposalCard
                    proposal={proposals[message.proposalId]}
                    userRole="student"
                    onAccept={() => onAcceptProposal(message.proposalId!)}
                    isAccepting={acceptingProposalId === message.proposalId}
                  />
                </div>
              </div>
            );
          }

          return (
            <ChatMessage
              key={message.id}
              message={message}
              sender={sender}
              isOwn={message.senderId === currentUserId}
            />
          );
        })}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-custom">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={async (e) => {
              if (e.key === "Enter") {
                await onSendMessage();
              }
            }}
            className="flex-1 border p-3 border-custom rounded-lg outline-none"
            placeholder="Type a message..."
          />
          <Button onClick={onSendMessage} className="bg-primary">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default StudentChatMessages;





