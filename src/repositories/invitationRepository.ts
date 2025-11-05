/**
 * Repository for invitation data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { InvitationI } from "@/src/models/invitation";

const isDevelopment = process.env.NODE_ENV === "development";
const USE_MOCK_DATA =
  isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const invitationRepository = {
  /**
   * Get all invitations
   * @param universityId - Optional filter by university
   */
  getAll: async (universityId?: string): Promise<InvitationI[]> => {
    if (USE_MOCK_DATA) {
      try {
        const mockData = await import("@/src/data/mockInvitations.json");
        let invitations = mockData.default as InvitationI[];
        if (universityId) {
          invitations = invitations.filter(
            (inv) => inv.universityId === universityId
          );
        }
        return invitations;
      } catch {
        // Mock file doesn't exist yet, return empty array
        return [];
      }
    }
    const url = universityId
      ? `/api/invitations?universityId=${universityId}`
      : "/api/invitations";
    return api.get<InvitationI[]>(url);
  },

  /**
   * Get invitation by ID
   */
  getById: async (id: string): Promise<InvitationI> => {
    if (USE_MOCK_DATA) {
      try {
        const mockData = await import("@/src/data/mockInvitations.json");
        const invitations = mockData.default as InvitationI[];
        const invitation = invitations.find((inv) => inv.id === id);
        if (!invitation) {
          throw new Error(`Invitation ${id} not found`);
        }
        return invitation;
      } catch {
        throw new Error(`Invitation ${id} not found`);
      }
    }
    return api.get<InvitationI>(`/api/invitations/${id}`);
  },

  /**
   * Get invitation by token
   */
  getByToken: async (token: string): Promise<InvitationI | null> => {
    if (USE_MOCK_DATA) {
      try {
        const mockData = await import("@/src/data/mockInvitations.json");
        const invitations = mockData.default as InvitationI[];
        const invitation = invitations.find((inv) => inv.token === token);
        return invitation || null;
      } catch {
        return null;
      }
    }
    try {
      return await api.get<InvitationI>(`/api/invitations/token/${token}`);
    } catch {
      return null;
    }
  },

  /**
   * Create new invitation
   */
  create: async (invitation: Partial<InvitationI>): Promise<InvitationI> => {
    if (USE_MOCK_DATA) {
      const newInvitation: InvitationI = {
        id: `inv-${Date.now()}`,
        email: invitation.email || "",
        role: invitation.role || "student",
        universityId: invitation.universityId,
        token: invitation.token || "",
        expiresAt: invitation.expiresAt || new Date().toISOString(),
        status: invitation.status || "PENDING",
        createdAt: new Date().toISOString(),
      };
      return newInvitation;
    }
    return api.post<InvitationI>("/api/invitations", invitation);
  },

  /**
   * Update invitation
   */
  update: async (
    id: string,
    invitation: Partial<InvitationI>
  ): Promise<InvitationI> => {
    if (USE_MOCK_DATA) {
      const existing = await invitationRepository.getById(id);
      return {
        ...existing,
        ...invitation,
        updatedAt: new Date().toISOString(),
      } as InvitationI;
    }
    return api.put<InvitationI>(`/api/invitations/${id}`, invitation);
  },
};
