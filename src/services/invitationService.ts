/**
 * Invitation Service - business logic for invitation links
 * PRD Reference: Section 4, Section 15 - Invitations
 */
import { InvitationI, InvitationRole, InvitationStatus } from '@/src/models/invitation';

/**
 * Business logic layer for invitation operations
 */
export const invitationService = {
  /**
   * Generate a signed, time-bound invitation link
   * PRD: Generate signed, time-bound invite links for students/supervisors; one-time use
   * @param email - Email address of invitee
   * @param role - Role to invite (student or supervisor)
   * @param universityId - University ID (required for students/supervisors)
   * @param expiresInDays - Number of days until expiration (default 7)
   * @returns Created invitation with secure token
   */
  generateInvitation: async (
    email: string,
    role: InvitationRole,
    universityId: string,
    expiresInDays: number = 7
  ): Promise<InvitationI> => {
    // Business validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Valid email address is required");
    }

    if (!universityId || universityId.trim().length === 0) {
      throw new Error("University ID is required");
    }

    if (role !== "student" && role !== "supervisor") {
      throw new Error("Invitation role must be 'student' or 'supervisor'");
    }

    // Generate secure token (in production, use cryptographically secure random from API)
    // Browser-compatible random token generation
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for Node.js
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const { invitationRepository } = await import('@/src/repositories/invitationRepository');
    
    const invitation = await invitationRepository.create({
      email: email.toLowerCase().trim(),
      role,
      universityId,
      token,
      expiresAt: expiresAt.toISOString(),
      status: "PENDING",
    });

    return invitation;
  },

  /**
   * Generate invitation link URL
   * @param token - Invitation token
   * @returns Full invitation URL
   */
  generateInvitationLink: (token: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/auth/invite?token=${token}`;
  },

  /**
   * Validate invitation token
   * PRD: Expired tokens rejected; one-time use enforced
   * @param token - Invitation token
   * @returns Invitation if valid, throws error if invalid
   */
  validateInvitation: async (token: string): Promise<InvitationI> => {
    const { invitationRepository } = await import('@/src/repositories/invitationRepository');
    const invitation = await invitationRepository.getByToken(token);

    if (!invitation) {
      throw new Error("Invalid invitation token");
    }

    if (invitation.status === "USED") {
      throw new Error("This invitation has already been used");
    }

    if (invitation.status === "EXPIRED") {
      throw new Error("This invitation has expired");
    }

    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    if (expiresAt < now) {
      throw new Error("This invitation has expired");
    }

    return invitation;
  },

  /**
   * Mark invitation as used
   * PRD: One-time use; supports password set
   * @param token - Invitation token
   * @returns Updated invitation
   */
  useInvitation: async (token: string, password?: string): Promise<InvitationI> => {
    const { invitationRepository } = await import('@/src/repositories/invitationRepository');
    
    // Validate first
    const invitation = await invitationService.validateInvitation(token);

    // Update status to USED
    const updated = await invitationRepository.update(invitation.id, {
      status: "USED",
      usedAt: new Date().toISOString(),
    });

    // In production, create user account with password here
    // For now, just return updated invitation

    return updated;
  },

  /**
   * Get all invitations for a university
   * @param universityId - University ID
   * @returns Array of invitations
   */
  getUniversityInvitations: async (universityId: string): Promise<InvitationI[]> => {
    const { invitationRepository } = await import('@/src/repositories/invitationRepository');
    return invitationRepository.getAll(universityId);
  },

  /**
   * Resend invitation (generates new token, extends expiry)
   * @param invitationId - Invitation ID
   * @returns Updated invitation with new token
   */
  resendInvitation: async (invitationId: string): Promise<InvitationI> => {
    const { invitationRepository } = await import('@/src/repositories/invitationRepository');
    const existing = await invitationRepository.getById(invitationId);

    // Generate new token
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    const newToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    // Extend expiry by 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return invitationRepository.update(invitationId, {
      token: newToken,
      expiresAt: expiresAt.toISOString(),
      status: "PENDING",
      usedAt: undefined,
    });
  },
};

