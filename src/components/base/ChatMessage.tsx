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
          <span className="text-[0.875rem] font-[600]">{sender.name}</span>
          <span className="text-[0.8125rem] opacity-60">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <div
          className={`rounded-lg px-6 py-4 max-w-[70%] ${
            isOwn ? "bg-primary text-white" : "bg-pale"
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


