export interface TenantBranding {
  id: string;
  tenant_id: string;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  dashboard_title: string;
  welcome_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateBrandingInput {
  logo_url?: string | null;
  primary_color?: string;
  accent_color?: string;
  dashboard_title?: string;
  welcome_message?: string | null;
}

