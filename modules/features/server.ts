"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/modules/auth/server";
import { requireTenantContext } from "@/modules/auth/server";
import { NotFoundError } from "@/lib/errors";
import { UpdateFeaturesInput, TenantFeatures } from "./types";
import * as queries from "./queries";

export async function getTenantFeatures(
  tenantId?: string
): Promise<TenantFeatures | null> {
  const targetTenantId = tenantId || (await requireTenantContext());
  return queries.getTenantFeatures(targetTenantId);
}

export async function updateTenantFeatures(
  tenantId: string,
  input: UpdateFeaturesInput
): Promise<TenantFeatures> {
  await requireSuperAdmin();

  const existing = await queries.getTenantFeatures(tenantId);
  if (!existing) {
    throw new NotFoundError("Features not found for this tenant");
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tenant_features")
    .update({
      ...(input.tickets_enabled !== undefined && {
        tickets_enabled: input.tickets_enabled,
      }),
      ...(input.contracts_enabled !== undefined && {
        contracts_enabled: input.contracts_enabled,
      }),
      ...(input.file_uploads_enabled !== undefined && {
        file_uploads_enabled: input.file_uploads_enabled,
      }),
      ...(input.activity_feed_enabled !== undefined && {
        activity_feed_enabled: input.activity_feed_enabled,
      }),
      ...(input.notifications_enabled !== undefined && {
        notifications_enabled: input.notifications_enabled,
      }),
    })
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update features: ${error.message}`);
  }

  return data;
}

export async function isFeatureEnabled(
  feature: keyof Omit<TenantFeatures, "id" | "tenant_id" | "created_at" | "updated_at">,
  tenantId?: string
): Promise<boolean> {
  const features = await getTenantFeatures(tenantId);
  if (!features) {
    return false;
  }
  return features[feature];
}

