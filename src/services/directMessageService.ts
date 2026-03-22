import { api } from "@/src/api/client";

export interface DirectMessageThread {
  id: number;
  otherUserId: number;
  otherName: string;
  otherEmail: string;
  otherRole: string;
  lastBody?: string;
  lastAt?: string;
  lastSenderId?: number;
  updatedAt?: string;
  /** Server: latest message exists and was sent by the other participant */
  lastFromOther?: boolean;
}

type RawThread = Record<string, unknown>;

function num(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function str(v: unknown): string {
  return v == null ? "" : String(v);
}

function boolish(v: unknown): boolean | undefined {
  if (v === true) return true;
  if (v === false) return false;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

/** Normalize Go / JSON variants (ID, LastSenderId, etc.) */
function normalizeDirectMessageThread(row: RawThread): DirectMessageThread {
  const id = num(row.id ?? row.ID);
  const otherUserId = num(row.otherUserId ?? row.OtherUserID ?? row.other_user_id) ?? 0;
  const lastSenderId = num(row.lastSenderId ?? row.LastSenderId ?? row.last_sender_id);
  const lastFromOther = boolish(row.lastFromOther ?? row.LastFromOther ?? row.last_from_other);
  return {
    id: id ?? 0,
    otherUserId,
    otherName: str(row.otherName ?? row.OtherName),
    otherEmail: str(row.otherEmail ?? row.OtherEmail),
    otherRole: str(row.otherRole ?? row.OtherRole),
    lastBody: str(row.lastBody ?? row.LastBody) || undefined,
    lastAt: str(row.lastAt ?? row.LastAt) || undefined,
    updatedAt: str(row.updatedAt ?? row.UpdatedAt) || undefined,
    lastSenderId: lastSenderId !== undefined && lastSenderId > 0 ? lastSenderId : undefined,
    lastFromOther,
  };
}

export interface DirectMessageRow {
  id: number;
  threadId: number;
  senderId: number;
  body: string;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    email: string;
    role?: string;
    profile?: { avatar?: string };
  };
}

export const directMessageService = {
  listThreads: async (): Promise<DirectMessageThread[]> => {
    const raw = await api.get<DirectMessageThread[] | RawThread[]>("/api/v1/direct-messages/threads");
    const list = Array.isArray(raw) ? raw : [];
    return list.map((row) => normalizeDirectMessageThread(row as RawThread)).filter((t) => t.id > 0);
  },

  createOrGetThread: async (
    targetUserId: number
  ): Promise<{ id: number; targetUserId: number }> => {
    return api.post("/api/v1/direct-messages/threads", { targetUserId });
  },

  listMessages: async (threadId: number): Promise<DirectMessageRow[]> => {
    return api.get(`/api/v1/direct-messages/threads/${threadId}/messages`);
  },

  sendMessage: async (threadId: number, body: string): Promise<DirectMessageRow> => {
    return api.post(`/api/v1/direct-messages/threads/${threadId}/messages`, { body });
  },

  getUniversityAdminForOrg: async (
    orgId: number
  ): Promise<{ userId: number; name: string; email: string; role: string }> => {
    return api.get(`/api/v1/direct-messages/university-org/${orgId}/admin-user`);
  },
};
