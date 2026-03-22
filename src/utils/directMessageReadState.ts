const LS_PREFIX = "strikeforce_dm_thread_read_ms";

export function getThreadLastReadMs(threadId: number): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(`${LS_PREFIX}_${threadId}`);
  if (!v) return 0;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

export function setThreadLastReadMs(threadId: number, ms: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${LS_PREFIX}_${threadId}`, String(ms));
}

export interface ThreadForUnread {
  id: number;
  lastAt?: string;
  updatedAt?: string;
  lastSenderId?: number;
  lastFromOther?: boolean;
}

export function threadHasUnreadFromOther(t: ThreadForUnread, currentUserId: number): boolean {
  const rawTime = t.lastAt || t.updatedAt;
  if (!rawTime) return false;
  const lastMs = new Date(rawTime).getTime();
  if (!Number.isFinite(lastMs) || lastMs <= 0) return false;
  const uid = Number(currentUserId);
  if (!Number.isFinite(uid)) return false;

  let fromOther: boolean;
  if (typeof t.lastFromOther === "boolean") {
    fromOther = t.lastFromOther;
  } else {
    const senderRaw = t.lastSenderId;
    if (senderRaw == null || senderRaw === 0) return false;
    const sid = Number(senderRaw);
    if (!Number.isFinite(sid) || sid === 0 || sid === uid) return false;
    fromOther = true;
  }

  if (!fromOther) return false;

  return lastMs > getThreadLastReadMs(t.id);
}

export function countUnreadThreads(threads: ThreadForUnread[], currentUserId: number): number {
  return threads.filter((t) => threadHasUnreadFromOther(t, currentUserId)).length;
}
