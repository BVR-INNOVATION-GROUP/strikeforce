"use client";

import React, { useEffect, useState } from "react";
import Card from "@/src/components/core/Card";
import { ChatThreadI, ChatMessageI } from "@/src/models/chat";
import { UserI } from "@/src/models/user";
import { chatService } from "@/src/services/chatService";
import { useAuthStore } from "@/src/store";
import MilestoneProposalForm from "@/src/components/screen/chat/MilestoneProposalForm";
import { useToast } from "@/src/hooks/useToast";
import ChatThreadList from "@/src/components/screen/chat/ChatThreadList";
import ChatMessagesView from "@/src/components/screen/chat/ChatMessagesView";
import ChatInput from "@/src/components/screen/chat/ChatInput";
import ChatPageSkeleton from "@/src/components/screen/chat/ChatPageSkeleton";
import { useChatHandlers } from "@/src/hooks/useChatHandlers";

/**
 * Partner Chat - view and send messages in project chat threads
 */
export default function PartnerChat() {
  const { user } = useAuthStore();
  const [threads, setThreads] = useState<ChatThreadI[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThreadI | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const chatHandlers = useChatHandlers({
    userId: user?.id?.toString(),
    selectedThread,
  });

  useEffect(() => {
    const loadThreads = async () => {
      try {
        if (user) {
          setLoading(true);
          const threadsData = await chatService.getUserThreads(user.id.toString());
          setThreads(threadsData);
          if (threadsData.length > 0 && !selectedThread) {
            setSelectedThread(threadsData[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load threads:", error);
      } finally {
        setLoading(false);
      }
    };
    loadThreads();
  }, [user]);

  if (loading) {
    return <ChatPageSkeleton />;
  }

  const handleSendMessage = async () => {
    try {
      await chatHandlers.handleSendMessage(messageText, threads, setThreads);
      setMessageText("");
    } catch (error) {
      showError('Failed to send message. Please try again.');
    }
  };

  const handleProposalSubmit = async (proposalData: Partial<import('@/src/models/milestone').MilestoneProposalI>) => {
    try {
      await chatHandlers.handleProposalSubmit(proposalData);
      showSuccess('Milestone proposal sent successfully!');
      setIsProposalModalOpen(false);
    } catch (error) {
      showError('Failed to submit proposal. Please try again.');
      throw error;
    }
  };

  const handleFinalizeProposal = async (proposalId: string) => {
    try {
      await chatHandlers.handleFinalizeProposal(proposalId);
      showSuccess('Proposal finalized! Milestone created successfully.');
    } catch (error: any) {
      showError(error?.message || 'Failed to finalize proposal. Please try again.');
    }
  };

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Chat</h1>
        <p className="text-[0.875rem] opacity-60">Communicate with project teams and supervisors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Thread List */}
        <ChatThreadList
          threads={threads}
          selectedThread={selectedThread}
          onSelectThread={setSelectedThread}
        />

        {/* Chat Messages */}
        <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          {selectedThread ? (
            <>
              <ChatMessagesView
                messages={chatHandlers.messages}
                users={chatHandlers.users}
                proposals={chatHandlers.proposals}
                currentUserId={user?.id?.toString()}
                userRole="partner"
                onFinalizeProposal={handleFinalizeProposal}
                isFinalizing={chatHandlers.finalizingProposalId !== null}
              />

              {/* Message Input */}
              <ChatInput
                messageText={messageText}
                onMessageChange={setMessageText}
                onSendMessage={handleSendMessage}
                onOpenProposalModal={() => setIsProposalModalOpen(true)}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[0.875rem] opacity-60">Select a conversation to start chatting</p>
            </div>
          )}
        </Card>
      </div>

      {/* Milestone Proposal Modal */}
      {selectedThread && (
        <MilestoneProposalForm
          open={isProposalModalOpen}
          projectId={selectedThread.projectId?.toString() || ""}
          onClose={() => setIsProposalModalOpen(false)}
          onSubmit={handleProposalSubmit}
        />
      )}

    </div>
  );
}