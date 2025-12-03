/**
 * Student Chat Thread List Component
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import { ChatThreadI } from "@/src/models/chat";

export interface Props {
  threads: ChatThreadI[];
  selectedThread: ChatThreadI | null;
  onSelect: (thread: ChatThreadI) => void;
}

/**
 * Display list of chat threads
 */
const StudentChatThreadList = ({
  threads,
  selectedThread,
  onSelect,
}: Props) => {
  return (
    <Card title="Conversations" className="lg:col-span-1">
      <div className="space-y-2">
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => onSelect(thread)}
            className={`p-3 rounded-lg cursor-pointer hover-bg-pale ${
              selectedThread?.id === thread.id ? "bg-pale-primary" : ""
            }`}
          >
            <p className="font-semibold">Project Chat</p>
            <p className="text-sm text-secondary">
              {thread.participantIds.length} participants
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StudentChatThreadList;









