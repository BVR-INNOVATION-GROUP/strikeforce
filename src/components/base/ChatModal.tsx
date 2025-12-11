/**
 * ChatModal - Right-side modal for project chat conversations
 * Upwork-style design with conversation view
 */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send } from 'lucide-react';
import IconButton from '@/src/components/core/IconButton';
import Button from '@/src/components/core/Button';
import Input from '@/src/components/core/Input';
import Avatar from '@/src/components/core/Avatar';
import Badge from '@/src/components/core/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessageI } from '@/src/models/chat';
import { UserI } from '@/src/models/user';
import { useToast } from '@/src/hooks/useToast';
import { chatService } from '@/src/services/chatService';
import { userRepository } from '@/src/repositories/userRepository';

export interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle?: string;
  applicationId?: number | null;
  applicationName?: string;
  messages?: ChatMessageI[]; // Optional - will be fetched if not provided
  users?: Record<string, UserI>; // Optional - will be fetched if not provided
  currentUserId?: string;
  onSendMessage?: (text: string) => Promise<void>;
}

/**
 * Right-side chat modal component
 * Slides in from the right with conversation view
 */
const ChatModal = ({
  open,
  onClose,
  projectId,
  projectTitle,
  applicationId,
  applicationName,
  messages: propMessages,
  users: propUsers,
  currentUserId,
  onSendMessage,
}: Props) => {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessageI[]>(propMessages || []);
  const [users, setUsers] = useState<Record<string, UserI>>(propUsers || {});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Ensure component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Load messages when modal opens
  useEffect(() => {
    if (!open || !projectId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        // Fetch messages using the new project endpoint
        const projectMessages = await chatService.getProjectMessages(projectId);
        setMessages(projectMessages);

        // Extract senders from messages and load users if needed
        const usersMap: Record<string, UserI> = { ...propUsers };

        // Add senders from messages
        projectMessages.forEach((msg) => {
          if (msg.sender) {
            const idStr = String(msg.sender.id);
            usersMap[idStr] = msg.sender;
            usersMap[msg.sender.id] = msg.sender;
          }
        });

        // If we still need more users, fetch all users
        if (Object.keys(usersMap).length === 0) {
          try {
            const allUsers = await userRepository.getAll();
            allUsers.forEach((u) => {
              const idStr = String(u.id);
              usersMap[idStr] = u;
              usersMap[u.id] = u;
            });
          } catch (error) {
            console.warn("Failed to load users:", error);
          }
        }

        setUsers(usersMap);
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.showError("Failed to load messages. Please try again.");
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [open, projectId]);

  // Update messages/users when props change
  useEffect(() => {
    if (propMessages) {
      setMessages(propMessages);
    }
  }, [propMessages]);

  useEffect(() => {
    if (propUsers && Object.keys(propUsers).length > 0) {
      setUsers(propUsers);
    }
  }, [propUsers]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  /**
   * Handle sending a message
   */
  const handleSend = async () => {
    if (!messageText.trim() || !onSendMessage || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(messageText.trim());
      setMessageText('');

      // Refresh messages after sending (plain HTTP, no websockets)
      try {
        const refreshedMessages = await chatService.getProjectMessages(projectId);
        setMessages(refreshedMessages);

        // Extract senders from refreshed messages
        const updatedUsersMap = { ...users };
        refreshedMessages.forEach((msg) => {
          if (msg.sender) {
            const idStr = String(msg.sender.id);
            updatedUsersMap[idStr] = msg.sender;
            updatedUsersMap[msg.sender.id] = msg.sender;
          }
        });
        setUsers(updatedUsersMap);
      } catch (refreshError) {
        console.warn("Failed to refresh messages after sending:", refreshError);
        // Don't show error - message was sent successfully
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      toast.showError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle Enter key press in message input
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - covers entire viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: 99998 }}
          />

          {/* Right-side modal */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[65%] min-w-[65%] bg-paper shadow-custom flex flex-col"
            style={{ zIndex: 99999 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-custom flex-shrink-0">
              <div>
                <h2 className="text-[1.125rem] font-[600] mb-1">
                  {applicationName ? `${applicationName} - Chat` : (projectTitle || 'Project Chat')}
                </h2>
                <p className="text-[0.8125rem] opacity-60">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </p>
              </div>
              <IconButton
                onClick={onClose}
                icon={<X size={20} />}
                className="hover-bg-pale"
              />
            </div>

            {/* Messages area - scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-[0.875rem] opacity-60">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[0.875rem] opacity-60">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  // Use sender from message if available, otherwise fallback to users map
                  const sender = message.sender || users[message.senderId] || users[String(message.senderId)];
                  const isOwn = String(message.senderId) === String(currentUserId);
                  const senderName = sender?.name || `User ${message.senderId}`;

                  const messageDate = (() => {
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
                  })();

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar
                        src={sender?.profile?.avatar}
                        name={senderName}
                        size="md"
                      />
                      <div
                        className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} flex-1 max-w-[75%]`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[0.875rem] font-[600]">
                            {senderName}
                          </span>
                          {sender?.role && (
                            <Badge variant="default" className="text-[0.75rem] px-2 py-0.5">
                              {sender.role}
                            </Badge>
                          )}
                          <span className="text-[0.8125rem] opacity-60">
                            {messageDate}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg px-6 py-4 ${isOwn
                            ? 'bg-primary text-white'
                            : 'bg-pale'
                            }`}
                        >
                          <p className="text-[0.875rem] leading-relaxed whitespace-pre-wrap">
                            {message.body}
                          </p>
                          {message.type === 'PROPOSAL' && (
                            <div
                              className={`mt-3 pt-3 ${isOwn ? 'border-white/20' : 'border-custom'
                                } border-t`}
                            >
                              <span className="text-[0.8125rem] opacity-90">
                                Proposal attached
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            {onSendMessage && (
              <div className="border-t border-custom p-6 flex-shrink-0">
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isSending}
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!messageText.trim() || isSending}
                    className="bg-primary text-white flex items-center gap-2 flex-shrink-0"
                  >
                    <Send size={18} />
                    {isSending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render modal in a portal to ensure it's at the root level
  return createPortal(modalContent, document.body);
};

export default ChatModal;

