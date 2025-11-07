/**
 * Repository for audit log data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { AuditEventI } from "@/src/utils/auditColumns";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

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
    if (getUseMockData()) {
      try {
        let events = await readJsonFile<AuditEventI>("mockAuditEvents.json");
        
        // Apply filters if provided
        if (filters?.type) {
          events = events.filter((e) => e.type === filters.type);
        }
        if (filters?.actor) {
          const actorStr = typeof filters.actor === 'number' ? filters.actor.toString() : filters.actor;
          events = events.filter((e) => e.actor === actorStr);
        }
        if (filters?.action) {
          events = events.filter((e) => e.action === filters.action);
        }
        
        return events;
      } catch {
        // Mock file doesn't exist yet, return empty array
        return [];
      }
    }
    
    // Production: Call API with filters
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.actor) params.append("actor", filters.actor.toString());
    if (filters?.action) params.append("action", filters.action);
    const url = `/api/audit?${params.toString()}`;
    return api.get<AuditEventI[]>(url);
  },

  /**
   * Get audit event by ID
   */
  getById: async (id: string): Promise<AuditEventI> => {
    if (getUseMockData()) {
      try {
        const events = await readJsonFile<AuditEventI>("mockAuditEvents.json");
        const event = events.find((e) => e.id === id);
        if (!event) {
          throw new Error(`Audit event ${id} not found`);
        }
        return event;
      } catch {
        throw new Error(`Audit event ${id} not found`);
      }
    }
    return api.get<AuditEventI>(`/api/audit/${id}`);
  },

  /**
   * Create audit event (for logging purposes)
   * Always uses API route to ensure events are persisted
   */
  create: async (event: Partial<AuditEventI>): Promise<AuditEventI> => {
    // Always use API route (even in mock mode) - API routes handle persistence server-side
    return api.post<AuditEventI>("/api/audit", event);
  },
};

