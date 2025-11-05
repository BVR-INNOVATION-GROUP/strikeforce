/**
 * Chat Input Component
 */
"use client";

import React from "react";
import Button from "@/src/components/core/Button";
import { Send, FileText } from "lucide-react";

export interface Props {
  messageText: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  onOpenProposalModal: () => void;
}

/**
 * Chat input with proposal button
 */
const ChatInput = ({
  messageText,
  onMessageChange,
  onSendMessage,
  onOpenProposalModal,
}: Props) => {
  return (
    <div className="p-6 border-t border-pale space-y-4 flex-shrink-0">
      <div className="flex gap-3">
        <Button
          onClick={onOpenProposalModal}
          className="bg-pale text-primary text-[0.875rem] py-2.5 px-4"
        >
          <FileText size={18} className="mr-2" />
          Propose Milestone
        </Button>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={messageText}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={async (e) => {
            if (e.key === "Enter") {
              await onSendMessage();
            }
          }}
          className="flex-1 border p-4 border-custom rounded-lg outline-none text-[0.875rem]"
          placeholder="Type a message..."
        />
        <Button onClick={onSendMessage} className="bg-primary p-4">
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;


