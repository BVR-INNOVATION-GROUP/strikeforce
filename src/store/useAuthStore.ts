"use client";

/**
 * Authentication store - manages user session and auth state
 * Note: In production, this would integrate with NextAuth session
 */
import { create } from "zustand";
import { UserI } from "@/src/models/user";

interface AuthState {
  user: UserI | null;
  isAuthenticated: boolean;
  setUser: (user: UserI | null) => void;
  logout: () => void;
  initializeStudent: () => Promise<void>;
  initializeUniversityAdmin: () => Promise<void>;
}

/**
 * Get default student user for development
 * Automatically loads student user when store is initialized
 */
const getDefaultStudentUser = async (): Promise<UserI | null> => {
  // Only in development mode
  if (process.env.NODE_ENV === "development") {
    try {
      const usersData = await import("@/src/data/mockUsers.json");
      const users = usersData.default as UserI[];
      const student = users.find((u) => u.role === "student");
      return student || null;
    } catch (error) {
      console.error("Failed to load default student user:", error);
      return null;
    }
  }
  return null;
};

/**
 * Get default university admin user for development
 * Automatically loads university admin user when store is initialized
 */
const getDefaultUniversityAdminUser = async (): Promise<UserI | null> => {
  // Only in development mode
  if (process.env.NODE_ENV === "development") {
    try {
      const usersData = await import("@/src/data/mockUsers.json");
      const users = usersData.default as UserI[];
      const universityAdmin = users.find((u) => u.role === "university-admin");
      return universityAdmin || null;
    } catch (error) {
      console.error("Failed to load default university admin user:", error);
      return null;
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    // Set cookie for middleware (in production, handled by NextAuth)
    if (user) {
      document.cookie = `user=${JSON.stringify({ role: user.role, id: user.id })}; path=/; max-age=86400`;
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
    // Clear cookie
    document.cookie = "user=; path=/; max-age=0";
  },
  initializeStudent: async () => {
    const student = await getDefaultStudentUser();
    if (student) {
      set({ user: student, isAuthenticated: true });
    }
  },
  initializeUniversityAdmin: async () => {
    const universityAdmin = await getDefaultUniversityAdminUser();
    if (universityAdmin) {
      set({ user: universityAdmin, isAuthenticated: true });
    }
  },
}));

