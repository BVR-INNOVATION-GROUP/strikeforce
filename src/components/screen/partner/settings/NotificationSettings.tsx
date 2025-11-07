/**
 * Notification Settings Section
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import { Bell } from "lucide-react";

export interface NotificationSettings {
  emailNotifications: boolean;
  milestoneUpdates: boolean;
  projectApplications: boolean;
  paymentAlerts: boolean;
  weeklyReports: boolean;
}

export interface Props {
  notifications: NotificationSettings;
  onChange: (key: string, value: boolean) => void;
}

/**
 * Notification preferences section
 */
const NotificationSettings = ({ notifications, onChange }: Props) => {
  const toggleItems = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      description: "Receive notifications via email",
    },
    {
      key: "milestoneUpdates",
      label: "Milestone Updates",
      description: "Notify when milestones are updated",
    },
    {
      key: "projectApplications",
      label: "Project Applications",
      description: "Notify when students apply to projects",
    },
    {
      key: "paymentAlerts",
      label: "Payment Alerts",
      description: "Notify about payment transactions",
    },
    {
      key: "weeklyReports",
      label: "Weekly Reports",
      description: "Receive weekly summary reports",
    },
  ];

  return (
    <Card title="Notification Preferences">
      <div className="space-y-4">
        {toggleItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-2 border-b border-custom last:border-0"
          >
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-primary" />
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-secondary">{item.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications[item.key as keyof NotificationSettings]}
                onChange={(e) => onChange(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-pale peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default NotificationSettings;






