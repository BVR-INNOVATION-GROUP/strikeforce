/**
 * Brand Color Picker Component
 * Allows organization owners to set their brand color
 */
"use client";

import React, { useState, useEffect } from "react";
import Button from "@/src/components/core/Button";
import { useToast } from "@/src/hooks/useToast";
import { useAuthStore } from "@/src/store";
import { organizationService } from "@/src/services/organizationService";

const BrandColorPicker = () => {
  const { organization, setOrganization, user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [color, setColor] = useState(organization?.brandColor || "#e9226e");
  const [saving, setSaving] = useState(false);

  // Sync color state when organization changes
  useEffect(() => {
    if (organization?.brandColor) {
      setColor(organization.brandColor);
    }
  }, [organization?.brandColor]);

  // Check if user is organization owner
  const isOrgOwner =
    user &&
    (user.role === "university-admin" || user.role === "partner") &&
    organization;

  if (!isOrgOwner) {
    return null; // Don't show for non-org owners
  }

  const handleSave = async () => {
    if (!organization?.id) {
      showError("Organization not found");
      return;
    }

    setSaving(true);
    try {
      await organizationService.updateOrganization(organization.id.toString(), {
        brandColor: color,
      });

      // Refresh organization data
      const updatedOrg = await organizationService.getOrganization(
        organization.id.toString()
      );
      setOrganization(updatedOrg);
      showSuccess("Brand color updated successfully!");
    } catch (error) {
      console.error("Failed to update brand color:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to update brand color. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const presetColors = [
    "#e9226e", // Primary pink (default)
    "#7C4C05", // Makerere dark brown
    "#D2AB67", // Makerere gold
    "#937751", // Makerere medium brown
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#ef4444", // Red
    "#06b6d4", // Cyan
    "#f97316", // Orange
  ];

  return (
    <div className="bg-paper rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-[1rem] font-[600] mb-1">Brand Color</h2>
        <p className="text-[0.875rem] opacity-60">
          Set your organization's brand color. This color will be used throughout
          the platform for your organization.
        </p>
      </div>

      <div className="space-y-4">
        {/* Color Picker */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Select Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-16 rounded-lg border-2 border-custom cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      setColor(value);
                    }
                  }}
                  placeholder="#e9226e"
                  className="w-full px-3 py-2 border border-custom rounded-lg bg-paper text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preset Colors */}
        <div>
          <label className="block text-sm font-medium mb-2">Preset Colors</label>
          <div className="flex flex-wrap gap-2">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  color === presetColor
                    ? "border-primary scale-110"
                    : "border-custom hover:border-primary/50"
                }`}
                style={{ backgroundColor: presetColor }}
                aria-label={`Select color ${presetColor}`}
              />
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            className="bg-primary text-white"
            disabled={saving || color === organization?.brandColor}
          >
            {saving ? "Saving..." : "Save Brand Color"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandColorPicker;

