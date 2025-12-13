"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/modules/auth/server";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { CreateTenantInput, UpdateTenantInput, Tenant } from "./types";
import * as queries from "./queries";

export async function getAllTenants(): Promise<Tenant[]> {
  await requireSuperAdmin();
  return queries.getAllTenants();
}

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  await requireSuperAdmin();

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(input.slug)) {
    throw new ValidationError(
      "Slug must contain only lowercase letters, numbers, and hyphens"
    );
  }

  // Check if slug already exists
  const existing = await queries.getTenantBySlug(input.slug);
  if (existing) {
    throw new ValidationError("Slug already exists");
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tenants")
    .insert({
      name: input.name,
      slug: input.slug,
      domain: input.domain || null,
      is_active: input.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create tenant: ${error.message}`);
  }

  // Create default branding
  await supabase.from("tenant_branding").insert({
    tenant_id: data.id,
    primary_color: "#1e293b",
    accent_color: "#1e293b",
    dashboard_title: `${input.name} Dashboard`,
  });

  // Create default features
  await supabase.from("tenant_features").insert({
    tenant_id: data.id,
    tickets_enabled: true,
    contracts_enabled: true,
    file_uploads_enabled: true,
    activity_feed_enabled: true,
    notifications_enabled: true,
  });

  return data;
}

export async function updateTenant(
  id: string,
  input: UpdateTenantInput
): Promise<Tenant> {
  await requireSuperAdmin();

  const existing = await queries.getTenantById(id);
  if (!existing) {
    throw new NotFoundError("Tenant not found");
  }

  // Validate slug if provided
  if (input.slug && !/^[a-z0-9-]+$/.test(input.slug)) {
    throw new ValidationError(
      "Slug must contain only lowercase letters, numbers, and hyphens"
    );
  }

  // Check if new slug conflicts
  if (input.slug && input.slug !== existing.slug) {
    const conflict = await queries.getTenantBySlug(input.slug);
    if (conflict) {
      throw new ValidationError("Slug already exists");
    }
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tenants")
    .update({
      ...(input.name && { name: input.name }),
      ...(input.slug && { slug: input.slug }),
      ...(input.domain !== undefined && { domain: input.domain }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update tenant: ${error.message}`);
  }

  return data;
}

export async function activateTenant(id: string): Promise<Tenant> {
  return updateTenant(id, { is_active: true });
}

export async function suspendTenant(id: string): Promise<Tenant> {
  return updateTenant(id, { is_active: false });
}

export async function deleteTenant(id: string): Promise<void> {
  await requireSuperAdmin();

  const existing = await queries.getTenantById(id);
  if (!existing) {
    throw new NotFoundError("Tenant not found");
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("tenants").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete tenant: ${error.message}`);
  }
}

