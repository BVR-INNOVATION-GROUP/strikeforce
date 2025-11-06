"use client";

/**
 * Authentication store - manages user session and auth state
 * Note: In production, this would integrate with NextAuth session
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserI } from "@/src/models/user";

interface AuthState {
  user: UserI | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean; // Internal flag for Zustand persist hydration
  setUser: (user: UserI | null) => void;
  logout: () => void;
  initializeStudent: () => Promise<void>;
  initializeUniversityAdmin: () => Promise<void>;
  initializeFromStorage: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
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

/**
 * Get user from cookie (for server-side middleware)
 */
function getUserFromCookie(): { role: string; id: number } | null {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  const userCookie = cookies.find((c) => c.trim().startsWith("user="));
  
  if (userCookie) {
    try {
      const userData = userCookie.split("=")[1];
      return JSON.parse(decodeURIComponent(userData));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Load full user data by ID from mock data
 */
async function loadUserById(id: number): Promise<UserI | null> {
  try {
    const usersData = await import("@/src/data/mockUsers.json");
    const users = usersData.default as UserI[];
    return users.find((u) => u.id === id) || null;
  } catch (error) {
    console.error("Failed to load user data:", error);
    return null;
  }
}

/**
 * Check if we should use test/dev auth (localStorage) or production auth (NextAuth)
 * In production, NextAuth handles sessions via cookies
 */
const useTestAuth = () => {
  // Use test auth if explicitly set or in development
  return (
    process.env.NEXT_PUBLIC_USE_TEST_AUTH === "true" ||
    process.env.NODE_ENV === "development"
  );
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        // Set cookie for middleware (in production, handled by NextAuth)
        if (typeof document !== "undefined") {
          if (user) {
            document.cookie = `user=${JSON.stringify({ role: user.role, id: user.id })}; path=/; max-age=86400`;
          } else {
            document.cookie = "user=; path=/; max-age=0";
          }
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear cookie
        if (typeof document !== "undefined") {
          document.cookie = "user=; path=/; max-age=0";
        }
      },
      initializeStudent: async () => {
        const student = await getDefaultStudentUser();
        if (student) {
          set({ user: student, isAuthenticated: true });
          if (typeof document !== "undefined") {
            document.cookie = `user=${JSON.stringify({ role: student.role, id: student.id })}; path=/; max-age=86400`;
          }
        }
      },
      initializeUniversityAdmin: async () => {
        const universityAdmin = await getDefaultUniversityAdminUser();
        if (universityAdmin) {
          set({ user: universityAdmin, isAuthenticated: true });
          if (typeof document !== "undefined") {
            document.cookie = `user=${JSON.stringify({ role: universityAdmin.role, id: universityAdmin.id })}; path=/; max-age=86400`;
          }
        }
      },
      initializeFromStorage: async () => {
        // Only use test auth in dev/test mode
        if (!useTestAuth()) {
          // In production, NextAuth handles sessions
          return;
        }
        
        // Zustand persist middleware automatically restores state from localStorage
        // We just need to ensure the cookie is set for middleware compatibility
        const state = get();
        if (state.user && typeof document !== "undefined") {
          // Ensure cookie is set for middleware
          document.cookie = `user=${JSON.stringify({ role: state.user.role, id: state.user.id })}; path=/; max-age=86400`;
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user data (not hydration flag)
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        // Don't persist _hasHydrated - it's always false on initial load
      }),
      // On rehydrate (when state is restored from localStorage), ensure cookie is set
      onRehydrateStorage: () => {
        // Called before rehydration
        return (state, error) => {
          // Called after rehydration
          if (error) {
            console.error("Error rehydrating auth state:", error);
            // Mark as hydrated even on error to prevent infinite loading
            if (typeof window !== "undefined") {
              setTimeout(() => {
                useAuthStore.getState().setHasHydrated(true);
              }, 0);
            }
            return;
          }
          
          // Mark as hydrated after successful rehydration
          if (state && typeof window !== "undefined") {
            // Use setTimeout to ensure this runs after state is set
            setTimeout(() => {
              useAuthStore.getState().setHasHydrated(true);
              
              // Set cookie for middleware compatibility (only in test/dev mode)
              if (useTestAuth() && state.user) {
                document.cookie = `user=${JSON.stringify({ role: state.user.role, id: state.user.id })}; path=/; max-age=86400`;
              }
            }, 0);
          } else {
            // No state to restore, mark as hydrated immediately
            if (typeof window !== "undefined") {
              setTimeout(() => {
                useAuthStore.getState().setHasHydrated(true);
              }, 0);
            }
          }
        };
      },
    }
  )
);

