/**
 * Account Settings Section
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Select from "@/src/components/core/Select";
import { Globe } from "lucide-react";

export interface AccountSettings {
  language: string;
  timezone: string;
  currency: string;
}

export interface Props {
  settings: AccountSettings;
  onChange: (key: string, value: string) => void;
}

/**
 * Account preferences section
 */
const AccountSettings = ({ settings, onChange }: Props) => {
  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
  ];

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
  ];

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
  ];

  return (
    <Card title="Account Preferences">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={20} className="text-primary" />
          <p className="text-sm text-secondary">General account settings</p>
        </div>

        <Select
          title="Language"
          options={languages}
          value={
            languages.find((l) => l.value === settings.language) || languages[0]
          }
          onChange={(option) => {
            const value =
              typeof option === "string"
                ? option
                : (option.value as string);
            onChange("language", value);
          }}
          placeHolder="Select language"
        />

        <Select
          title="Timezone"
          options={timezones}
          value={
            timezones.find((t) => t.value === settings.timezone) || timezones[0]
          }
          onChange={(option) => {
            const value =
              typeof option === "string"
                ? option
                : (option.value as string);
            onChange("timezone", value);
          }}
          placeHolder="Select timezone"
        />

        <Select
          title="Currency"
          options={currencies}
          value={
            currencies.find((c) => c.value === settings.currency) ||
            currencies[0]
          }
          onChange={(option) => {
            const value =
              typeof option === "string"
                ? option
                : (option.value as string);
            onChange("currency", value);
          }}
          placeHolder="Select currency"
        />
      </div>
    </Card>
  );
};

export default AccountSettings;






