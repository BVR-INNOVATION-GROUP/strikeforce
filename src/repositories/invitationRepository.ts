/**
 * Repository for invitation data operations
 * Abstracts data source - can use mock JSON files or real API
 */
import { api } from "@/src/api/client";
import { InvitationI } from "@/src/models/invitation";
import { getUseMockData } from "@/src/utils/config";
import { readJsonFile, findById } from "@/src/utils/fileHelpers";

export const invitationRepository = {
  /**
   * Get all invitations
   * @param universityId - Optional filter by university
   */
  getAll: async (universityId?: number | string): Promise<InvitationI[]> => {
    if (getUseMockData()) {
      try {
        let invitations = await readJsonFile<InvitationI>(
          "mockInvitations.json"
        );
        if (universityId) {
          const numericUniversityId =
            typeof universityId === "string"
              ? parseInt(universityId, 10)
              : universityId;
          invitations = invitations.filter(
            (inv) => inv.universityId === numericUniversityId
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
  getById: async (id: number | string): Promise<InvitationI> => {
    if (getUseMockData()) {
      try {
        const invitations = await readJsonFile<InvitationI>(
          "mockInvitations.json"
        );
        const invitation = findById(invitations, id);
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
    if (getUseMockData()) {
      try {
        const invitations = await readJsonFile<InvitationI>(
          "mockInvitations.json"
        );
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
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.post<InvitationI>("/api/invitations", invitation);
  },

  /**
   * Update invitation
   */
  update: async (
    id: number,
    invitation: Partial<InvitationI>
  ): Promise<InvitationI> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.put<InvitationI>(`/api/invitations/${id}`, invitation);
  },

  /**
   * Delete invitation
   */
  delete: async (id: number): Promise<void> => {
    // Always use API route (even in mock mode) - API routes handle file operations server-side
    return api.delete(`/api/invitations/${id}`);
  },
};
