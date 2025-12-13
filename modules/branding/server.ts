"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireSuperAdmin, requireTenantAdmin } from "@/modules/auth/server";
import { NotFoundError } from "@/lib/errors";
import { UpdateBrandingInput, TenantBranding } from "./types";
import * as queries from "./queries";

export async function updateTenantBranding(
  tenantId: string,
  input: UpdateBrandingInput
): Promise<TenantBranding> {
  // Allow super_admin or tenant_admin to update
  const session = await requireTenantAdmin();

  // If not super_admin, ensure they're updating their own tenant
  if (session.user.role !== "super_admin" && session.user.tenant_id !== tenantId) {
    throw new Error("You can only update branding for your own tenant");
  }

  const existing = await queries.getTenantBranding(tenantId);
  const supabase = createServiceRoleClient();

  if (!existing) {
    // Create new branding if it doesn't exist
    const { data, error } = await supabase
      .from("tenant_branding")
      .insert({
        tenant_id: tenantId,
        logo_url: input.logo_url || null,
        primary_color: input.primary_color || "#1e293b",
        accent_color: input.accent_color || "#1e293b",
        dashboard_title: input.dashboard_title || "Dashboard",
        welcome_message: input.welcome_message || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create branding: ${error.message}`);
    }

    return data;
  }

  // Update existing branding
  const { data, error } = await supabase
    .from("tenant_branding")
    .update({
      ...(input.logo_url !== undefined && { logo_url: input.logo_url }),
      ...(input.primary_color && { primary_color: input.primary_color }),
      ...(input.accent_color && { accent_color: input.accent_color }),
      ...(input.dashboard_title && { dashboard_title: input.dashboard_title }),
      ...(input.welcome_message !== undefined && {
        welcome_message: input.welcome_message,
      }),
    })
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update branding: ${error.message}`);
  }

  return data;
}

