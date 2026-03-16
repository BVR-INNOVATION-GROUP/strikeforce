"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/src/store/useThemeStore";

const STORAGE_KEY = "strikeforce-theme";

const ThemeInitializer = () => {
  const { theme, setTheme } = useThemeStore();

  // On mount, hydrate theme from localStorage or system preference
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      let initial = stored === "light" || stored === "dark" ? (stored as "light" | "dark") : null;

      if (!initial && typeof window !== "undefined" && window.matchMedia) {
        initial = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }

      if (initial) {
        setTheme(initial);
      }
    } catch {
      // ignore
    }
  }, [setTheme]);

  // Apply theme to <html> attribute and persist
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  return null;
};

export default ThemeInitializer;

