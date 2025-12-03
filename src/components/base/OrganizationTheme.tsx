/**
 * OrganizationTheme Component
 * Dynamically applies organization brand color as primary color for all users in that org
 */
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/store";

const DEFAULT_PRIMARY = "#e9226e";
const DEFAULT_PALE_PRIMARY = "#ee6e9f12";
const DEFAULT_ACCENT = "#e9226e";

/**
 * Convert hex color to rgba with opacity for pale-primary
 */
function hexToRgba(hex: string, opacity: number): string {
  // Remove # if present
  let cleanHex = hex.replace("#", "");
  
  // Handle 3-digit hex (e.g., #f00 -> #ff0000)
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  
  // Validate length
  if (cleanHex.length !== 6) {
    return `rgba(233, 34, 110, ${opacity})`; // Default fallback
  }
  
  // Parse hex
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Validate parsed values
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(233, 34, 110, ${opacity})`; // Default fallback
  }
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Generate a pale version of the primary color (very light background)
 */
function generatePalePrimary(primaryColor: string): string {
  return hexToRgba(primaryColor, 0.07); // Very light opacity for pale-primary
}

const OrganizationTheme = () => {
  const { organization } = useAuthStore();

  useEffect(() => {
    const root = document.documentElement;
    
    if (organization?.brandColor) {
      // Validate and normalize hex color format
      let brandColor = organization.brandColor.trim();
      
      // Ensure it starts with #
      if (!brandColor.startsWith("#")) {
        brandColor = "#" + brandColor;
      }
      
      // Validate hex color format (3 or 6 hex digits)
      const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(brandColor);
      
      if (isValidHex) {
        // Normalize to 6-digit hex if it's 3-digit
        if (brandColor.length === 4) {
          brandColor = "#" + brandColor.slice(1).split("").map(c => c + c).join("");
        }
        
        // Apply brand color as primary
        root.style.setProperty("--primary", brandColor);
        root.style.setProperty("--accent", brandColor);
        root.style.setProperty("--pale-primary", generatePalePrimary(brandColor));
      } else {
        // Invalid color, use default
        root.style.setProperty("--primary", DEFAULT_PRIMARY);
        root.style.setProperty("--accent", DEFAULT_ACCENT);
        root.style.setProperty("--pale-primary", DEFAULT_PALE_PRIMARY);
      }
    } else {
      // No brand color, use default
      root.style.setProperty("--primary", DEFAULT_PRIMARY);
      root.style.setProperty("--accent", DEFAULT_ACCENT);
      root.style.setProperty("--pale-primary", DEFAULT_PALE_PRIMARY);
    }
  }, [organization?.brandColor, organization?.id]);

  // This component doesn't render anything
  return null;
};

export default OrganizationTheme;

