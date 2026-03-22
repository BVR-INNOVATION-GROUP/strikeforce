"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Send, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/src/components/core/Button";
import Input from "@/src/components/core/Input";
import Avatar from "@/src/components/core/Avatar";
import { BASE_URL } from "@/src/api/client";
import {
  directMessageService,
  DirectMessageRow,
  DirectMessageThread,
} from "@/src/services/directMessageService";
import { useToast } from "@/src/hooks/useToast";
import { setThreadLastReadMs, threadHasUnreadFromOther } from "@/src/utils/directMessageReadState";

export type ReloadThreadsFn = (opts?: { silent?: boolean }) => Promise<void>;

export interface DirectMessagesInboxPanelProps {
  open: boolean;
  onClose: () => void;
  threads: DirectMessageThread[];
  threadsLoading?: boolean;
  onReloadThreads: ReloadThreadsFn;
  currentUserId: number;
  onThreadRead: () => void;
}

function shortTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function msgId(m: DirectMessageRow & { ID?: number }): number {
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

export default function DirectMessagesInboxPanel({
  open,
  onClose,
  threads,
  onReloadThreads,
  threadsLoading = false,
  currentUserId,
  onThreadRead,
}: DirectMessagesInboxPanelProps) {
  const { showError } = useToast();
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DirectMessageRow[]>([]);
  const [text, setText] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMsgLenRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const selected = useMemo(
    () => threads.find((t) => t.id === selectedId) ?? null,
    [threads, selectedId]
  );

  const loadMessages = useCallback(
    async (threadId: number) => {
      setLoadingMsgs(true);
      try {
        const list = await directMessageService.listMessages(threadId);
        const arr = Array.isArray(list) ? list : [];
        setMessages(arr);
        let readMs = Date.now();
        if (arr.length > 0) {
          readMs = arr.reduce((max, m) => {
            const t = new Date(m.createdAt).getTime();
            return Number.isFinite(t) && t > max ? t : max;
          }, 0);
          if (readMs === 0) readMs = Date.now();
        }
        setThreadLastReadMs(threadId, readMs);
        onThreadRead();
      } catch (e) {
        showError(e instanceof Error ? e.message : "Failed to load messages");
        setMessages([]);
      } finally {
        setLoadingMsgs(false);
      }
    },
    [onThreadRead, showError]
  );

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setMessages([]);
      setText("");
      return;
    }
    void onReloadThreads({ silent: threads.length > 0 });
  }, [open, onReloadThreads, threads.length]);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => void onReloadThreads({ silent: true }), 25000);
    return () => window.clearInterval(id);
  }, [open, onReloadThreads]);

  useEffect(() => {
    if (!open || !selectedId) {
      return;
    }
    void loadMessages(selectedId);
  }, [open, selectedId, loadMessages]);

  useEffect(() => {
    prevMsgLenRef.current = 0;
  }, [selectedId]);

  useEffect(() => {
    if (!open || !selectedId) return;
    const n = messages.length;
    const prev = prevMsgLenRef.current;
    prevMsgLenRef.current = n;
    if (n === 0) return;
    if (n > prev) {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, [open, selectedId, messages]);

  const handleSelectThread = (id: number) => {
    setSelectedId(id);
    setText("");
  };

  const handleSend = async () => {
    if (!selectedId || !text.trim()) return;
    setSending(true);
    try {
      await directMessageService.sendMessage(selectedId, text.trim());
      setText("");
      await loadMessages(selectedId);
      await onReloadThreads({ silent: true });
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      const ta = new Date(a.updatedAt || a.lastAt || 0).getTime();
      const tb = new Date(b.updatedAt || b.lastAt || 0).getTime();
      return tb - ta;
    });
  }, [threads]);

  if (!mounted || typeof document === "undefined") return null;

  const me = String(currentUserId);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.button
          key="dm-backdrop"
          type="button"
          aria-label="Close messages"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100050] bg-black/45"
          onClick={onClose}
        />
      )}
      {open && (
        <motion.div
          key="dm-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Messages"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="fixed right-0 top-0 z-[100051] flex h-full w-full max-w-[min(100vw,960px)] flex-col border-l border-custom bg-[var(--paper)] shadow-2xl md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
            <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-custom px-3 md:hidden">
              <h2 className="text-base font-semibold text-primary">Messages</h2>
              <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-pale" aria-label="Close">
                <X size={22} />
              </button>
            </div>

            <aside className="flex w-full max-h-[40vh] flex-col border-b border-custom md:h-full md:max-h-none md:w-[min(100%,320px)] md:border-b-0 md:border-r">
              <div className="hidden h-[52px] shrink-0 items-center border-b border-custom px-4 md:flex">
                <MessageCircle className="mr-2 text-primary" size={22} />
                <h2 className="text-lg font-semibold text-primary">Messages</h2>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {threadsLoading && sortedThreads.length === 0 ? (
                  <p className="p-4 text-sm opacity-60">Loading conversations…</p>
                ) : sortedThreads.length === 0 ? (
                  <div className="p-6 text-center text-sm text-secondary">
                    <p className="mb-2 font-medium text-primary">No conversations yet</p>
                    <p className="opacity-80">
                      When someone messages you, or you start a chat from the platform, it will appear here.
                    </p>
                  </div>
                ) : (
                  <ul className="py-1">
                    {sortedThreads.map((t) => {
                      const unread = threadHasUnreadFromOther(t, currentUserId);
                      const active = selectedId === t.id;
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectThread(t.id)}
                            className={`flex w-full gap-3 px-3 py-3 text-left transition-colors ${
                              active ? "bg-primary/10" : "hover:bg-pale"
                            }`}
                          >
                            <Avatar name={t.otherName || "User"} className="h-12 w-12 shrink-0 text-sm" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <div className="flex min-w-0 max-w-[calc(100%-3rem)] items-center gap-1.5">
                                  <span className={`truncate font-medium ${unread ? "text-primary" : "text-secondary"}`}>
                                    {t.otherName || "User"}
                                  </span>
                                  <RolePaleChip role={t.otherRole} />
                                </div>
                                <span className="shrink-0 text-[0.65rem] opacity-50">
                                  {shortTime(t.lastAt || t.updatedAt)}
                                </span>
                              </div>
                              <p
                                className={`mt-0.5 truncate text-xs ${
                                  unread ? "font-medium text-primary" : "text-secondary opacity-80"
                                }`}
                              >
                                {t.lastBody || "No messages yet"}
                              </p>
                            </div>
                            {unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </aside>

            <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-pale/30">
              {!selected ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-secondary">
                  <MessageCircle size={48} className="opacity-30" />
                  <p className="text-sm font-medium text-primary">Select a conversation</p>
                  <p className="max-w-xs text-xs opacity-70">Your message history is kept per contact.</p>
                </div>
              ) : (
                <>
                  <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-custom bg-paper px-4">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 hover:bg-pale md:hidden"
                      aria-label="Back to list"
                      onClick={() => setSelectedId(null)}
                    >
                      <span className="text-lg">‹</span>
                    </button>
                    <Avatar name={selected.otherName || "User"} className="h-11 w-11 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate font-semibold text-primary">{selected.otherName}</p>
                        <RolePaleChip role={selected.otherRole} />
                      </div>
                      {selected.otherEmail ? (
                        <p className="truncate text-xs text-secondary opacity-70">{selected.otherEmail}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="ml-auto hidden rounded-lg p-2 hover:bg-pale md:inline-flex"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>
                  </header>

                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4">
                    {loadingMsgs ? (
                      <p className="text-center text-sm opacity-60">Loading…</p>
                    ) : (
                      messages.map((m) => {
                        const id = msgId(m);
                        const mine = me && String(m.senderId) === me;
                        return (
                          <div
                            key={id}
                            className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
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
                              className={`max-w-[min(100%,420px)] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                                mine
                                  ? "rounded-br-md bg-primary text-white"
                                  : "rounded-bl-md border border-custom bg-paper text-primary"
                              }`}
                            >
                              {!mine && m.sender?.name && (
                                <p className="mb-1 flex flex-wrap items-center gap-1.5">
                                  <span className="text-[0.65rem] font-medium opacity-60">{m.sender.name}</span>
                                  {m.sender?.role ? <RolePaleChip role={m.sender.role} /> : null}
                                </p>
                              )}
                              <p className="break-words whitespace-pre-wrap">{m.body}</p>
                              <p className={`mt-1 text-[0.6rem] ${mine ? "text-white/70" : "opacity-50"}`}>
                                {shortTime(m.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <footer className="shrink-0 border-t border-custom bg-paper p-3">
                    <div className="flex gap-2">
                      <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message…"
                        className="flex-1 rounded-full border-custom bg-pale/50"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void handleSend();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        className="h-11 w-11 shrink-0 rounded-full bg-primary p-0 text-white"
                        onClick={() => void handleSend()}
                        disabled={sending || !text.trim()}
                        loading={sending}
                        aria-label="Send"
                      >
                        <Send size={18} className="mx-auto" />
                      </Button>
                    </div>
                  </footer>
                </>
              )}
            </section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
