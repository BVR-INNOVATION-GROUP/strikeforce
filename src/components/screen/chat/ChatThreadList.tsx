/**
 * Chat Thread List Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import { ChatThreadI } from "@/src/models/chat";

export interface Props {
  threads: ChatThreadI[];
  selectedThread: ChatThreadI | null;
  onSelectThread: (thread: ChatThreadI) => void;
}

/**
 * List of chat threads/conversations
 */
const ChatThreadList = ({
  threads,
  selectedThread,
  onSelectThread,
}: Props) => {
  return (
    <Card title="Conversations" className="lg:col-span-1 h-full overflow-y-auto">
      {threads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[0.875rem] opacity-60 mb-2">No conversations yet</p>
          <p className="text-[0.8125rem] opacity-40">Chat threads will appear here when messages are sent.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => onSelectThread(thread)}
              className={`p-6 rounded-lg cursor-pointer bg-pale hover:bg-very-pale transition-colors ${
                selectedThread?.id === thread.id ? "bg-pale-primary border border-primary" : ""
              }`}
            >
              <p className="text-[0.9375rem] font-[600] mb-2">Project Chat</p>
              <p className="text-[0.8125rem] opacity-60">
                {thread.participantIds.length} participant{thread.participantIds.length > 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ChatThreadList;


