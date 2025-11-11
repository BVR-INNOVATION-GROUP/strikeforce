"use client";

/**
 * UI state store - manages modals, sidebars, notifications, and UI preferences
 */
import { create } from "zustand";

interface NotificationI {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: string;
}

interface UIState {
  isSidebarOpen: boolean;
  notifications: NotificationI[];
  activeModal: string | null;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<NotificationI, "id" | "timestamp">) => void;
  removeNotification: (id: string) => void;
  setActiveModal: (modalId: string | null) => void;
  reset: () => void; // Reset UI state (used on logout)
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  notifications: [],
  activeModal: null,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  setActiveModal: (modalId) =>
    set({ activeModal: modalId }),
  reset: () =>
    set({
      isSidebarOpen: true,
      notifications: [],
      activeModal: null,
    }),
}));

