/**
 * Color contrast utilities for ensuring accessibility
 * Based on WCAG 2.1 guidelines
 */

/**
 * Convert HSL string (e.g., "150 25% 38%") to RGB values
 */
function hslToRgb(hsl: string): [number, number, number] {
  const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) {
    throw new Error("Invalid HSL format");
  }

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Calculate relative luminance of an RGB color
 * Based on WCAG 2.1 formula
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 (no contrast) and 21 (maximum contrast)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hslToRgb(color1);
  const rgb2 = hslToRgb(color2);

  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * - Normal text: 4.5:1
 * - Large text (18pt+ or 14pt+ bold): 3:1
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Determine the best foreground color (black or white) for a given background
 * Returns HSL string for the foreground color
 */
export function getBestForegroundColor(backgroundHsl: string): string {
  const white = "0 0% 98%";
  const black = "0 0% 2%";

  const whiteContrast = getContrastRatio(white, backgroundHsl);
  const blackContrast = getContrastRatio(black, backgroundHsl);

  // Choose the color with better contrast
  // But ensure it meets WCAG AA (4.5:1) for normal text
  if (whiteContrast >= 4.5 && whiteContrast >= blackContrast) {
    return white;
  } else if (blackContrast >= 4.5) {
    return black;
  } else {
    // If neither meets 4.5:1, choose the one with better contrast
    // and adjust lightness if needed
    if (whiteContrast > blackContrast) {
      return white;
    } else {
      return black;
    }
  }
}

/**
 * Adjust color lightness to be visible on dark background
 * Returns a new HSL string with adjusted lightness
 * Ensures the color is visible against a dark background (for dark mode)
 */
export function adjustLightnessForDarkBackground(
  colorHsl: string,
  minContrast: number = 3.0
): string {
  const match = colorHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) {
    return colorHsl;
  }

  const h = match[1];
  const s = match[2];
  let l = parseInt(match[3]);

  const darkBackground = "0 0% 2%"; // Our dark mode background
  let currentContrast = getContrastRatio(colorHsl, darkBackground);

  // If contrast is too low, lighten the color
  const maxIterations = 50;
  let iterations = 0;

  while (currentContrast < minContrast && iterations < maxIterations && l < 90) {
    l = Math.min(90, l + 3); // Lighten the color
    const newColor = `${h} ${s}% ${l}%`;
    currentContrast = getContrastRatio(newColor, darkBackground);
    iterations++;
  }

  return `${h} ${s}% ${l}%`;
}

/**
 * Adjust color lightness to meet contrast requirements
 * Returns a new HSL string with adjusted lightness
 * @deprecated Use adjustLightnessForDarkBackground for dark mode
 */
export function adjustLightnessForContrast(
  colorHsl: string,
  targetContrast: number = 4.5,
  isDark: boolean = false
): string {
  if (isDark) {
    // For dark mode, ensure color is visible on dark background
    return adjustLightnessForDarkBackground(colorHsl, 3.0);
  }
  
  // For light mode (not used in our app, but kept for completeness)
  const match = colorHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) {
    return colorHsl;
  }

  const h = match[1];
  const s = match[2];
  let l = parseInt(match[3]);

  const foreground = "0 0% 2%";
  let currentContrast = getContrastRatio(foreground, colorHsl);

  const maxIterations = 50;
  let iterations = 0;

  while (currentContrast < targetContrast && iterations < maxIterations) {
    l = Math.max(5, l - 2);
    const newColor = `${h} ${s}% ${l}%`;
    currentContrast = getContrastRatio(foreground, newColor);
    iterations++;
  }

  return `${h} ${s}% ${l}%`;
}

/**
 * Determine if a color is dark or light
 * Returns true if the color is dark (needs light text)
 */
export function isDarkColor(colorHsl: string): boolean {
  const match = colorHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) {
    return true; // Default to dark
  }

  const lightness = parseInt(match[3]);
  return lightness < 50;
}

/**
 * Get appropriate foreground color for primary
 * Automatically chooses white or black based on contrast
 */
export function getPrimaryForeground(primaryHsl: string): string {
  return getBestForegroundColor(primaryHsl);
}

/**
 * Get appropriate foreground color for accent
 * Automatically chooses white or black based on contrast
 */
export function getAccentForeground(accentHsl: string): string {
  return getBestForegroundColor(accentHsl);
}

