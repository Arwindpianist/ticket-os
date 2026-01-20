import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Contract } from "./types";

export async function getTenantContracts(tenantId: string): Promise<Contract[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch contracts: ${error.message}`);
  }

  return data || [];
}

export async function getAllContracts(): Promise<Contract[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch contracts: ${error.message}`);
  }

  return data || [];
}

export async function getContractById(
  contractId: string,
  tenantId: string
): Promise<Contract | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .eq("tenant_id", tenantId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch contract: ${error.message}`);
  }

  return data;
}

