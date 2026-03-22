"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/src/components/core/Button";
import Input from "@/src/components/core/Input";
import Avatar from "@/src/components/core/Avatar";
import { BASE_URL } from "@/src/api/client";
import {
  directMessageService,
  DirectMessageRow,
} from "@/src/services/directMessageService";
import { useToast } from "@/src/hooks/useToast";

export interface SuperAdminDirectMessageModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: number | null;
  title?: string;
  currentUserId?: string | number;
}

function msgKey(m: DirectMessageRow & { ID?: number }): number {
  const v = m.id ?? m.ID;
  return typeof v === "number" ? v : Number(v);
}

function senderAvatarSrc(sender?: DirectMessageRow["sender"]): string | undefined {
  const raw = sender?.profile?.avatar;
  if (!raw || typeof raw !== "string" || !raw.trim()) return undefined;
  return raw.startsWith("http") ? raw : `${BASE_URL}/${raw}`;
}

function RolePaleChip({ role }: { role?: string }) {
  if (!role?.trim()) return null;
  const text = role.replace(/-/g, " ");
  return (
    <span className="shrink-0 rounded bg-pale px-1.5 py-0.5 text-[0.65rem] font-medium capitalize text-secondary">
      {text}
    </span>
  );
}

export default function SuperAdminDirectMessageModal({
  open,
  onClose,
  targetUserId,
  title = "Direct message",
  currentUserId,
}: SuperAdminDirectMessageModalProps) {
  const { showError } = useToast();
  const [mounted, setMounted] = useState(false);
  const [threadId, setThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DirectMessageRow[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const loadThread = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const t = await directMessageService.createOrGetThread(targetUserId);
      setThreadId(t.id);
      const list = await directMessageService.listMessages(t.id);
      setMessages(Array.isArray(list) ? list : []);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to open conversation");
      setThreadId(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, showError]);

  useEffect(() => {
    if (!open || !targetUserId) {
      setThreadId(null);
      setMessages([]);
      setText("");
      return;
    }
    loadThread();
  }, [open, targetUserId, loadThread]);

  const me = currentUserId != null ? String(currentUserId) : "";

  const contactName = useMemo(() => {
    if (title.startsWith("Message ")) return title.slice(8).trim() || title;
    return title;
  }, [title]);

  const contactRole = useMemo(() => {
    const other = messages.find((m) => String(m.senderId) !== me && m.sender?.role);
    return other?.sender?.role;
  }, [messages, me]);

  const handleSend = async () => {
    if (!threadId || !text.trim()) return;
    setSending(true);
    try {
      await directMessageService.sendMessage(threadId, text.trim());
      setText("");
      const list = await directMessageService.listMessages(threadId);
      setMessages(Array.isArray(list) ? list : []);
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.button
          key="sadm-backdrop"
          type="button"
          aria-label="Close"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-black/40"
          onClick={onClose}
        />
      )}
      {open && (
        <motion.div
          key="sadm-sheet"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="fixed right-0 top-0 z-[201] flex h-full w-full max-w-md flex-col border-l border-custom bg-paper shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-3 border-b border-custom p-4">
              <Avatar name={contactName} className="h-11 w-11 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold">{contactName}</h2>
                  <RolePaleChip role={contactRole} />
                </div>
              </div>
              <button type="button" onClick={onClose} className="shrink-0 rounded-lg p-2 hover:bg-pale" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loading ? (
                <p className="text-sm opacity-60">Loading…</p>
              ) : (
                messages.map((m) => {
                  const mine = me && String(m.senderId) === me;
                  return (
                    <div
                      key={msgKey(m)}
                      className={`flex items-end gap-2 ${mine ? "flex-row-reverse justify-end" : "justify-start"}`}
                    >
                      {!mine && (
                        <Avatar
                          src={senderAvatarSrc(m.sender)}
                          name={m.sender?.name}
                          size="sm"
                          className="shrink-0"
                        />
                      )}
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          mine ? "bg-primary text-white" : "bg-pale text-primary"
                        }`}
                      >
                        {!mine && m.sender?.name && (
                          <p className="mb-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-xs opacity-70">{m.sender.name}</span>
                            {m.sender?.role ? <RolePaleChip role={m.sender.role} /> : null}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap">{m.body}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex gap-2 border-t border-custom p-4">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <Button
                type="button"
                className="bg-primary px-4 text-white"
                onClick={() => void handleSend()}
                disabled={sending || !threadId || !text.trim()}
                loading={sending}
              >
                <Send size={18} />
              </Button>
            </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
