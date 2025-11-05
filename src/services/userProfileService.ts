/**
 * Service layer for user profile business logic
 * Handles validation, transformations, and orchestrates repository calls
 */
import { userRepository } from "@/src/repositories/userRepository";
import { UserI } from "@/src/models/user";

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatar?: string;
}

export const userProfileService = {
  /**
   * Update user profile with validation
   */
  updateProfile: async (
    userId: string,
    profileData: ProfileUpdateData
  ): Promise<UserI> => {
    // Business validation
    if (profileData.email && !profileData.email.includes("@")) {
      throw new Error("Invalid email address");
    }

    if (profileData.phone && profileData.phone.length < 10) {
      throw new Error("Phone number must be at least 10 digits");
    }

    // Get existing user
    const existing = await userRepository.getById(userId);

    // Transform data for update
    const updatedUser: UserI = {
      ...existing,
      name: profileData.name || existing.name,
      email: profileData.email || existing.email,
      profile: {
        ...existing.profile,
        bio: profileData.bio ?? existing.profile.bio,
        phone: profileData.phone ?? existing.profile.phone,
        location: profileData.location ?? existing.profile.location,
        avatar: profileData.avatar ?? existing.profile.avatar,
      },
      updatedAt: new Date().toISOString(),
    };

    return userRepository.update(userId, updatedUser);
  },

  /**
   * Get user profile
   */
  getProfile: async (userId: string): Promise<UserI> => {
    return userRepository.getById(userId);
  },
};





