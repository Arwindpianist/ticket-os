export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  domain?: string | null;
  is_active?: boolean;
}

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
  domain?: string | null;
  is_active?: boolean;
}

