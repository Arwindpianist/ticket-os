import { createServiceRoleClient } from "@/lib/supabase/server";
import { TenantFeatures } from "./types";

export async function getTenantFeatures(
  tenantId: string
): Promise<TenantFeatures | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tenant_features")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch features: ${error.message}`);
  }

  return data;
}

