"use client";

import { create } from "zustand";

export type ThemeMode = "light" | "dark";

export interface ThemeState {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  setTheme: (mode: ThemeMode) => {
    set({ theme: mode });
  },
  toggleTheme: () => {
    const next: ThemeMode = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
  },
}));

