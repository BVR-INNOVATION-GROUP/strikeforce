/**
 * Password reset token model
 * Stores password reset tokens with expiration
 */
export interface PasswordResetTokenI {
  id: number;
  userId: number;
  token: string;
  expiresAt: string; // ISO date string
  used: boolean;
  createdAt: string;
}


