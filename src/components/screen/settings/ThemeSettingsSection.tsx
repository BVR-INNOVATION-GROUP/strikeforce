"use client";

import React from "react";
import Button from "@/src/components/core/Button";
import { useThemeStore } from "@/src/store/useThemeStore";
import { Sun, Moon } from "lucide-react";

const ThemeSettingsSection = () => {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  const isDark = theme === "dark";

  return (
    <div className="bg-paper border border-custom rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[0.95rem] font-[600]">Theme</h2>
          <p className="text-[0.8rem] text-muted">
            Switch between light and dark mode across the app.
          </p>
        </div>
        <Button
          onClick={toggleTheme}
          className="bg-pale text-primary text-xs px-3 py-1.5 flex items-center gap-2"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          {isDark ? "Light mode" : "Dark mode"}
        </Button>
      </div>
      <div className="flex items-center gap-2 text-[0.8rem] text-muted-light">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-custom ${
            isDark ? "bg-pale text-secondary" : "bg-very-pale text-secondary"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isDark ? "bg-primary" : "bg-primary"
            }`}
          />
          {isDark ? "Dark mode is active" : "Light mode is active"}
        </span>
      </div>
    </div>
  );
};

export default ThemeSettingsSection;

