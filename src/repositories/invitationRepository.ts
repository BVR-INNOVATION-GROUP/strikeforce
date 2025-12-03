/**
 * Repository for invitation data operations
 * Connects to backend API
 * Note: Backend Invitation module may need to be implemented
 */
import { api } from "@/src/api/client";
import { InvitationI } from "@/src/models/invitation";

export const invitationRepository = {
  /**
   * Get all invitations
   * @param universityId - Optional filter by university
   */
  getAll: async (universityId?: number | string): Promise<InvitationI[]> => {
    const url = universityId
      ? `/api/v1/invitations?universityId=${universityId}`
      : "/api/v1/invitations";
    return api.get<InvitationI[]>(url);
  },

  /**
   * Get invitation by ID
   */
  getById: async (id: number | string): Promise<InvitationI> => {
    return api.get<InvitationI>(`/api/v1/invitations/${id}`);
  },

  /**
   * Get invitation by token
   */
  getByToken: async (token: string): Promise<InvitationI | null> => {
    try {
      return await api.get<InvitationI>(`/api/v1/invitations/token/${token}`);
    } catch {
      return null;
    }
  },

  /**
   * Create new invitation
   */
  create: async (invitation: Partial<InvitationI>): Promise<InvitationI> => {
    return api.post<InvitationI>("/api/v1/invitations", invitation);
  },

  /**
   * Update invitation
   */
  update: async (
    id: number,
    invitation: Partial<InvitationI>
  ): Promise<InvitationI> => {
    return api.put<InvitationI>(`/api/v1/invitations/${id}`, invitation);
  },

  /**
   * Delete invitation
   */
  delete: async (id: number): Promise<void> => {
    return api.delete(`/api/v1/invitations/${id}`);
  },
};
