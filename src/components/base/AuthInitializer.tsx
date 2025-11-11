"use client";

/**
 * AuthInitializer - Ensures auth state is properly hydrated on page load
 * In test/dev mode: Restores from localStorage and sets cookie
 * In production: Would integrate with NextAuth session
 */
import { useEffect } from "react";
import { useAuthStore } from "@/src/store";

export default function AuthInitializer() {
  const { _hasHydrated, initializeFromStorage, setHasHydrated } = useAuthStore();

  useEffect(() => {
    // Zustand persist middleware automatically hydrates
    // The onRehydrateStorage callback handles marking as hydrated
    // But if there's no persisted state, we need to mark as hydrated manually
    
    // If already hydrated, ensure cookie is set
    if (_hasHydrated) {
      initializeFromStorage();
      return;
    }
    
    // If not hydrated after a short delay, mark as hydrated (no persisted state)
    // This handles the case where there's no localStorage data
    const timer = setTimeout(() => {
      const currentState = useAuthStore.getState();
      if (!currentState._hasHydrated) {
        currentState.setHasHydrated(true);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [_hasHydrated, initializeFromStorage, setHasHydrated]);

  return null; // This component doesn't render anything
}


