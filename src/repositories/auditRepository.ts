/**
 * Repository for audit log data operations
 * Connects to backend API
 * Note: Backend Audit module may need to be implemented
 */
import { api } from "@/src/api/client";
import { AuditEventI } from "@/src/utils/auditColumns";

export const auditRepository = {
  /**
   * Get all audit events
   * @param filters - Optional filters (type, actor, action)
   */
  getAll: async (filters?: {
    type?: string;
    actor?: string | number;
    action?: string;
  }): Promise<AuditEventI[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.actor) params.append("actor", filters.actor.toString());
    if (filters?.action) params.append("action", filters.action);
    const url = params.toString() ? `/api/v1/audit?${params.toString()}` : "/api/v1/audit";
    return api.get<AuditEventI[]>(url);
  },

  /**
   * Get audit event by ID
   */
  getById: async (id: string): Promise<AuditEventI> => {
    return api.get<AuditEventI>(`/api/v1/audit/${id}`);
  },

  /**
   * Create audit event (for logging purposes)
   */
  create: async (event: Partial<AuditEventI>): Promise<AuditEventI> => {
    return api.post<AuditEventI>("/api/v1/audit", event);
  },
};


