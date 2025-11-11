"use client";

/**
 * Authentication store - manages user session and auth state
 * Note: In production, this would integrate with NextAuth session
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserI } from "@/src/models/user";
import { OrganizationI } from "@/src/models/organization";
import { useUIStore } from "./useUIStore";
import { useProjectStore } from "./useProjectStore";

interface AuthState {
  user: UserI | null;
  organization: OrganizationI | null; // University organization for university-admin
  isAuthenticated: boolean;
  _hasHydrated: boolean; // Internal flag for Zustand persist hydration
  setUser: (user: UserI | null) => Promise<void>;
  setOrganization: (organization: OrganizationI | null) => void;
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
const UseTestAuth = () => {
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
      organization: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      setOrganization: (organization) => {
        set({ organization });
      },
      setUser: async (user) => {
        set({ user, isAuthenticated: !!user });

        // If university-admin, fetch and store organization using orgId
        if (user && user.role === "university-admin" && user.orgId) {
          try {
            const { organizationService } = await import(
              "@/src/services/organizationService"
            );
            const organization = await organizationService
              .getOrganization(user.orgId.toString())
              .catch(() => null);
            set({ organization });
          } catch (error) {
            console.error("Failed to fetch organization:", error);
            set({ organization: null });
          }
        } else {
          set({ organization: null });
        }

        // Set cookie for middleware (in production, handled by NextAuth)
        if (typeof document !== "undefined") {
          if (user) {
            document.cookie = `user=${JSON.stringify({
              role: user.role,
              id: user.id,
            })}; path=/; max-age=86400`;
          } else {
            document.cookie = "user=; path=/; max-age=0";
          }
        }
      },
      logout: () => {
        // Set logout flag FIRST to prevent rehydration
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("__logout_flag__", "true");
          } catch (error) {
            console.error("Failed to set logout flag:", error);
          }
        }

        // Clear Zustand store state
        set({ user: null, organization: null, isAuthenticated: false });

        if (typeof window === "undefined") return;

        // Clear localStorage for auth store (Zustand persist)
        // Do this BEFORE clearing cookies to ensure state is cleared
        try {
          localStorage.removeItem("auth-storage");
          // Also clear unknown other auth-related localStorage items
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("auth-") || key.includes("user")) {
              localStorage.removeItem(key);
            }
          });
        } catch (error) {
          console.error("Failed to clear auth localStorage:", error);
        }

        // Clear sessionStorage (but keep logout flag for now)
        try {
          const logoutFlag = sessionStorage.getItem("__logout_flag__");
          sessionStorage.clear();
          // Restore logout flag
          if (logoutFlag) {
            sessionStorage.setItem("__logout_flag__", "true");
          }
        } catch (error) {
          console.error("Failed to clear sessionStorage:", error);
        }

        // Clear all cookies (including user cookie and unknown NextAuth cookies)
        // Get all cookies first
        const cookies = document.cookie.split(";");
        const hostname = window.location.hostname;
        const domainParts = hostname.split(".");

        // Clear each cookie with multiple variations to ensure it's removed
        cookies.forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name =
            eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

          if (!name) return;

          // Clear with different path and domain combinations
          const clearVariations = [
            `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
            `${name}=; path=/; domain=${hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
            `${name}=; path=/; domain=.${hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
          ];

          // If domain has multiple parts, also try parent domain
          if (domainParts.length > 1) {
            const parentDomain = "." + domainParts.slice(-2).join(".");
            clearVariations.push(
              `${name}=; path=/; domain=${parentDomain}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            );
          }

          clearVariations.forEach((clearString) => {
            document.cookie = clearString;
          });
        });

        // Explicitly clear the user cookie with all variations
        const userCookieClearVariations = [
          "user=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT",
          `user=; path=/; domain=${hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
          `user=; path=/; domain=.${hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        ];

        if (domainParts.length > 1) {
          const parentDomain = "." + domainParts.slice(-2).join(".");
          userCookieClearVariations.push(
            `user=; path=/; domain=${parentDomain}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          );
        }

        userCookieClearVariations.forEach((clearString) => {
          document.cookie = clearString;
        });

        // Verify cookie is cleared by checking document.cookie
        // Force clear one more time after a brief delay to ensure it's gone
        setTimeout(() => {
          // Double-check and clear again
          userCookieClearVariations.forEach((clearString) => {
            document.cookie = clearString;
          });
        }, 50);

        // Reset other stores (UI store, project store)
        try {
          useUIStore.getState().reset();
          useProjectStore.getState().reset();
        } catch (error) {
          console.error("Failed to reset stores:", error);
          // Continue with logout even if store reset fails
        }

        // Clear NextAuth session if available
        try {
          // Dynamically import next-auth to avoid errors if not configured
          import("next-auth/react")
            .then(({ signOut }) => {
              signOut({ redirect: false, callbackUrl: "/" }).catch(() => {
                // NextAuth not configured or no session, ignore error
              });
            })
            .catch(() => {
              // NextAuth not available, continue with logout
            });
        } catch (error) {
          // NextAuth not available, continue with logout
        }
      },
      initializeStudent: async () => {
        const student = await getDefaultStudentUser();
        if (student) {
          set({ user: student, isAuthenticated: true });
          if (typeof document !== "undefined") {
            document.cookie = `user=${JSON.stringify({
              role: student.role,
              id: student.id,
            })}; path=/; max-age=86400`;
          }
        }
      },
      initializeUniversityAdmin: async () => {
        const universityAdmin = await getDefaultUniversityAdminUser();
        if (universityAdmin) {
          set({ user: universityAdmin, isAuthenticated: true });

          // Fetch and store organization for university-admin using orgId
          if (universityAdmin.orgId) {
            try {
              const { organizationService } = await import(
                "@/src/services/organizationService"
              );
              const organization = await organizationService
                .getOrganization(universityAdmin.orgId.toString())
                .catch(() => null);
              set({ organization });
            } catch (error) {
              console.error("Failed to fetch organization:", error);
              set({ organization: null });
            }
          }

          if (typeof document !== "undefined") {
            document.cookie = `user=${JSON.stringify({
              role: universityAdmin.role,
              id: universityAdmin.id,
            })}; path=/; max-age=86400`;
          }
        }
      },
      initializeFromStorage: async () => {
        // Only use test auth in dev/test mode
        if (!UseTestAuth()) {
          // In production, NextAuth handles sessions
          return;
        }

        // Zustand persist middleware automatically restores state from localStorage
        // We just need to ensure the cookie is set for middleware compatibility
        const state = get();
        if (state.user && typeof document !== "undefined") {
          // Ensure cookie is set for middleware
          document.cookie = `user=${JSON.stringify({
            role: state.user.role,
            id: state.user.id,
          })}; path=/; max-age=86400`;
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user data and organization (not hydration flag)
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        isAuthenticated: state.isAuthenticated,
        // Don't persist _hasHydrated - it's always false on initial load
      }),
      // On rehydrate (when state is restored from localStorage), ensure cookie is set
      onRehydrateStorage: () => {
        // Called before rehydration
        return (rehydratedState, error) => {
          // Check if we just logged out - if so, prevent rehydration
          if (typeof window !== "undefined") {
            const logoutFlag = sessionStorage.getItem("__logout_flag__");
            if (logoutFlag === "true") {
              // Clear logout flag
              sessionStorage.removeItem("__logout_flag__");
              // Use setTimeout to access store after initialization
              setTimeout(() => {
                try {
                  // Access store after it's fully initialized
                  const store = useAuthStore.getState();
                  // Force state to be null
                  store.setUser(null);
                  store.setHasHydrated(true);
                  // Clear cookie
                  document.cookie =
                    "user=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                } catch (err) {
                  // If store not ready, the state will be null anyway from logout
                  console.warn("Store access during logout rehydration:", err);
                }
              }, 0);
              return;
            }
          }

          // Called after rehydration
          if (error) {
            console.error("Error rehydrating auth state:", error);
            // Mark as hydrated even on error to prevent infinite loading
            if (typeof window !== "undefined") {
              setTimeout(() => {
                try {
                  useAuthStore.getState().setHasHydrated(true);
                } catch (err) {
                  // Store will be initialized on next render
                }
              }, 0);
            }
            return;
          }

          // Mark as hydrated after successful rehydration
          if (rehydratedState && typeof window !== "undefined") {
            // Use setTimeout to ensure this runs after state is set
            setTimeout(() => {
              try {
                useAuthStore.getState().setHasHydrated(true);

                // Set cookie for middleware compatibility (only in test/dev mode)
                // Only set cookie if user exists and we didn't just logout
                if (UseTestAuth() && rehydratedState.user) {
                  const logoutFlag = sessionStorage.getItem("__logout_flag__");
                  if (logoutFlag !== "true") {
                    document.cookie = `user=${JSON.stringify({
                      role: rehydratedState.user.role,
                      id: rehydratedState.user.id,
                    })}; path=/; max-age=86400`;
                  }
                }
              } catch (err) {
                // Store will be initialized on next render
              }
            }, 0);
          } else {
            // No state to restore, mark as hydrated immediately
            if (typeof window !== "undefined") {
              setTimeout(() => {
                try {
                  useAuthStore.getState().setHasHydrated(true);
                } catch (err) {
                  // Store will be initialized on next render
                }
              }, 0);
            }
          }
        };
      },
    }
  )
);
