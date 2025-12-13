export interface TenantBranding {
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  dashboard_title: string;
  welcome_message: string | null;
}

export function applyBrandingStyles(branding: TenantBranding): string {
  // Convert hex colors to HSL if needed, or use directly
  // For simplicity, we'll use CSS custom properties
  return `
    :root {
      --brand-primary: ${branding.primary_color};
      --brand-accent: ${branding.accent_color};
    }
  `;
}

export function getBrandingCSSVariables(branding: TenantBranding): Record<string, string> {
  return {
    "--brand-primary": branding.primary_color,
    "--brand-accent": branding.accent_color,
  };
}

