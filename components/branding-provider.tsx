"use client";

import { useEffect } from "react";
import { TenantBranding } from "@/types/branding";
import {
  getPrimaryForeground,
  getAccentForeground,
  adjustLightnessForDarkBackground,
} from "@/lib/color-contrast";

interface BrandingProviderProps {
  branding?: TenantBranding | null;
  children: React.ReactNode;
}

export function BrandingProvider({ branding, children }: BrandingProviderProps) {
  useEffect(() => {
    if (!branding) {
      // Reset to defaults
      const root = document.documentElement;
      root.style.setProperty("--brand-primary", "150 25% 38%");
      root.style.setProperty("--brand-accent", "150 20% 12%");
      root.style.setProperty("--primary", "150 25% 38%");
      root.style.setProperty("--accent", "150 20% 12%");
      root.style.setProperty("--primary-foreground", "0 0% 98%");
      root.style.setProperty("--accent-foreground", "0 0% 98%");
      root.style.setProperty("--ring", "150 25% 35%");
      return;
    }

    // Convert hex colors to HSL if needed, or use directly if already HSL
    const root = document.documentElement;
    
    // If colors are hex, convert to HSL format for Tailwind
    // Otherwise assume they're already in HSL format
    let primaryColor = (branding.primary_color || "").trim();
    let accentColor = (branding.accent_color || "").trim();
    
    // Simple hex to HSL conversion helper
    const hexToHsl = (hex: string): string => {
      // Remove # if present and ensure we have 6 characters
      hex = hex.replace("#", "");
      if (hex.length === 3) {
        // Expand shorthand hex (e.g., #f00 -> #ff0000)
        hex = hex.split("").map(char => char + char).join("");
      }
      
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    
    // Convert hex to HSL if needed
    if (primaryColor.startsWith("#")) {
      primaryColor = hexToHsl(primaryColor);
    } else if (!primaryColor.match(/^\d+\s+\d+%\s+\d+%$/)) {
      // If not hex and not HSL format, use default
      primaryColor = "150 25% 38%";
    }
    
    if (accentColor.startsWith("#")) {
      accentColor = hexToHsl(accentColor);
    } else if (!accentColor.match(/^\d+\s+\d+%\s+\d+%$/)) {
      // If not hex and not HSL format, use default
      accentColor = "150 20% 12%";
    }
    
    // Adjust primary and accent colors if needed to ensure visibility on dark background
    // Lighten colors if they're too dark to be visible
    const adjustedPrimary = adjustLightnessForDarkBackground(primaryColor, 3.0);
    const adjustedAccent = adjustLightnessForDarkBackground(accentColor, 3.0);
    
    // Calculate appropriate foreground colors for contrast based on adjusted colors
    const primaryForeground = getPrimaryForeground(adjustedPrimary);
    const accentForeground = getAccentForeground(adjustedAccent);
    
    // Set brand variables
    root.style.setProperty("--brand-primary", adjustedPrimary);
    root.style.setProperty("--brand-accent", adjustedAccent);
    
    // Also override the primary and accent variables so components automatically use branding
    root.style.setProperty("--primary", adjustedPrimary);
    root.style.setProperty("--accent", adjustedAccent);
    
    // Set foreground colors for primary and accent (automatically calculated for best contrast)
    root.style.setProperty("--primary-foreground", primaryForeground);
    root.style.setProperty("--accent-foreground", accentForeground);
    
    // Update ring color to match primary (slightly adjusted for better visibility)
    // Extract lightness and adjust it
    const lightnessMatch = adjustedPrimary.match(/(\d+)%/);
    if (lightnessMatch) {
      const lightness = parseInt(lightnessMatch[1]);
      const adjustedLightness = Math.max(20, lightness - 5); // Slightly darker for ring
      const ringColor = adjustedPrimary.replace(/\d+%/, `${adjustedLightness}%`);
      root.style.setProperty("--ring", ringColor);
    } else {
      root.style.setProperty("--ring", adjustedPrimary);
    }
    
    // Apply dashboard title and welcome message if available
    if (branding.dashboard_title) {
      // Store in data attribute for use in components
      root.setAttribute("data-dashboard-title", branding.dashboard_title);
    }
    if (branding.welcome_message) {
      root.setAttribute("data-welcome-message", branding.welcome_message);
    }
  }, [branding]);

  return <>{children}</>;
}
