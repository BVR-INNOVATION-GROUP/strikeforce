/**
 * Service layer for password reset business logic
 * Handles validation, transformations, and orchestrates API calls
 */
import { api } from "@/src/api/client";

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

/**
 * Business logic layer for password reset operations
 */
export const passwordResetService = {
  /**
   * Request password reset - sends reset email
   * @param email - User email address
   * @returns Success message
   * @throws Error if request fails
   */
  requestPasswordReset: async (email: string): Promise<ForgotPasswordResponse> => {
    // Business validation
    if (!email || !email.trim()) {
      throw new Error("Email is required");
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format");
    }

    // Call API endpoint via API client
    return api.post<ForgotPasswordResponse>("/api/auth/forgot-password", {
      email: email.toLowerCase().trim(),
    });
  },

  /**
   * Reset password using token
   * @param token - Reset token from email
   * @param password - New password
   * @returns Success message
   * @throws Error if reset fails
   */
  resetPassword: async (
    token: string,
    password: string
  ): Promise<ResetPasswordResponse> => {
    // Business validation
    if (!token || !token.trim()) {
      throw new Error("Reset token is required");
    }

    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Call API endpoint via API client
    return api.post<ResetPasswordResponse>("/api/auth/reset-password", {
      token,
      password,
    });
  },
};




