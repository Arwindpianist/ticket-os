import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Tenant } from "./types";

export async function getAllTenants(): Promise<Tenant[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tenants: ${error.message}`);
  }

  return data || [];
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch tenant: ${error.message}`);
  }

  return data;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch tenant: ${error.message}`);
  }

  return data;
}

export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("domain", domain)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch tenant: ${error.message}`);
  }

  return data;
}

