/**
 * Chat Messages View Component
 */
"use client";

import React from "react";
import ChatMessage from "@/src/components/base/ChatMessage";
import ProposalCard from "@/src/components/screen/chat/ProposalCard";
import { ChatMessageI } from "@/src/models/chat";
import { UserI } from "@/src/models/user";
import { MilestoneProposalI } from "@/src/models/milestone";

export interface Props {
  messages: ChatMessageI[];
  users: Record<string, UserI>;
  proposals: Record<string, MilestoneProposalI>;
  currentUserId: string | undefined;
  userRole: string;
  onFinalizeProposal: (proposalId: string) => void;
  isFinalizing: boolean;
}

/**
 * Display chat messages and proposals
 */
const ChatMessagesView = ({
  messages,
  users,
  proposals,
  currentUserId,
  userRole,
  onFinalizeProposal,
  isFinalizing,
}: Props) => {
  return (
    <div className="flex-1 overflow-y-auto space-y-6 mb-4 p-8">
      {messages.map((message) => {
        // Use sender from message if available, otherwise fallback to users map
        const sender = message.sender || users[message.senderId] || users[String(message.senderId)];
        if (!sender) {
          // Don't hide messages - show with fallback info
          const fallbackSender = {
            id: message.senderId,
            name: `User ${message.senderId}`,
            email: "",
            profile: {},
          };
          return (
            <ChatMessage
              key={message.id}
              message={message}
              sender={fallbackSender}
              isOwn={String(message.senderId) === currentUserId}
            />
          );
        }

        // Show ProposalCard for PROPOSAL type messages
        if (
          message.type === "PROPOSAL" &&
          message.proposalId &&
          proposals[message.proposalId]
        ) {
          return (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"
                }`}
            >
              <div className="max-w-[80%]">
                <div className="mb-3 text-[0.8125rem] opacity-60 flex items-center gap-3">
                  <span className="font-[600]">{sender.name}</span>
                  <span>
                    {(() => {
                      const dateStr = message.createdAt;
                      if (!dateStr) return "Unknown time";

                      try {
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) {
                          return "Unknown time";
                        }
                        return date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      } catch (error) {
                        console.warn("Failed to parse date:", dateStr, error);
                        return "Unknown time";
                      }
                    })()}
                  </span>
                </div>
                <ProposalCard
                  proposal={proposals[message.proposalId]}
                  userRole={userRole}
                  onFinalize={() => onFinalizeProposal(message.proposalId!)}
                  isFinalizing={isFinalizing}
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
  );
};

export default ChatMessagesView;


