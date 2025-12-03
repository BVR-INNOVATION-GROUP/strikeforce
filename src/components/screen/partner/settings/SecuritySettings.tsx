/**
 * Security Settings Section
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Input from "@/src/components/core/Input";
import { Shield } from "lucide-react";

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
}

export interface Props {
  security: SecuritySettings;
  onChange: (key: string, value: boolean | string) => void;
}

/**
 * Security preferences section
 */
const SecuritySettings = ({ security, onChange }: Props) => {
  return (
    <Card title="Security">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={20} className="text-primary" />
          <p className="text-sm text-secondary">Account security settings</p>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-custom">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-secondary">
              Add an extra layer of security
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={security.twoFactorEnabled}
              onChange={(e) => onChange("twoFactorEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-pale peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after-border-custom after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <Input
          title="Session Timeout (minutes)"
          type="number"
          value={security.sessionTimeout}
          onChange={(e) => onChange("sessionTimeout", e.target.value)}
          min="1"
          max="1440"
          placeholder="30"
        />
      </div>
    </Card>
  );
};

export default SecuritySettings;









