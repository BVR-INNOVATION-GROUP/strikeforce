"use client";

import React from "react";
import Avatar from "../core/Avatar";
import { ChatMessageI } from "@/src/models/chat";
import { UserI } from "@/src/models/user";

export interface Props {
  message: ChatMessageI;
  sender: UserI;
  isOwn: boolean;
}

/**
 * ChatMessage component for displaying chat messages
 */
const ChatMessage = ({ message, sender, isOwn }: Props) => {
  return (
    <div className={`flex gap-4 ${isOwn ? "flex-row-reverse" : ""}`}>
      <Avatar src={sender.profile.avatar} name={sender.name} size="sm" />
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} flex-1`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[0.875rem] font-[600]">{sender.name || `User ${message.senderId}`}</span>
          <span className="text-[0.8125rem] opacity-60">
            {(() => {
              const dateStr = message.createdAt;
              if (!dateStr) return "Unknown time";

              try {
                // Try parsing the date - handle various formats
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
        <div
          className={`rounded-lg px-6 py-4 max-w-[70%] ${isOwn ? "bg-primary text-white" : "bg-pale"
            }`}
        >
          <p className="text-[0.875rem] leading-relaxed">{message.body}</p>
          {message.type === "PROPOSAL" && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <span className="text-[0.8125rem] opacity-90">Proposal attached</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;


