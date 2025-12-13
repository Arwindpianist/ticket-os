import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { TenantBranding } from "./types";

export async function getTenantBranding(
  tenantId: string
): Promise<TenantBranding | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tenant_branding")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch branding: ${error.message}`);
  }

  return data;
}

