"use server";

import { createClient } from "@/lib/supabase/server";
import { requireTenantContext } from "@/modules/auth/server";
import { getContracts } from "@/modules/contracts/server";
import { ContractItem } from "@/components/contract-builder";

export interface LimitCheckResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  period: "monthly" | "quarterly" | "half_yearly" | "yearly";
  message?: string;
}

/**
 * Check if a contract item has reached its limit
 */
export async function checkContractItemLimit(
  contractItemId: string
): Promise<LimitCheckResult> {
  const tenantId = await requireTenantContext();
  const supabase = createClient();

  // Parse contract item ID (format: contractId-itemId)
  const [contractId, itemId] = contractItemId.split("-");
  if (!contractId || !itemId) {
    throw new Error("Invalid contract item ID format");
  }

  // Get the contract to find the item
  const contracts = await getContracts();
  const contract = contracts.find((c) => c.id === contractId);
  
  if (!contract) {
    throw new Error("Contract not found");
  }

  const summary = contract.summary as any;
  if (!summary?.items || !Array.isArray(summary.items)) {
    throw new Error("Contract has no items");
  }

  const item = summary.items.find((i: ContractItem) => i.id === itemId);
  if (!item) {
    throw new Error("Contract item not found");
  }

  // If item doesn't have a limit, always allow
  if (item.type !== "limit" || !item.value) {
    return {
      allowed: true,
      currentCount: 0,
      limit: 0,
      period: "monthly",
    };
  }

  const limit = item.value as number;
  const period = item.limit_period || "monthly";

  // Calculate the start date based on period
  const now = new Date();
  let periodStart: Date;

  switch (period) {
    case "monthly":
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarterly":
      const quarter = Math.floor(now.getMonth() / 3);
      periodStart = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case "half_yearly":
      const half = Math.floor(now.getMonth() / 6);
      periodStart = new Date(now.getFullYear(), half * 6, 1);
      break;
    case "yearly":
      periodStart = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Count tickets for this contract item in the current period
  const { count, error } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("contract_item_id", contractItemId)
    .gte("created_at", periodStart.toISOString());

  if (error) {
    throw new Error(`Failed to check limit: ${error.message}`);
  }

  const currentCount = count || 0;
  const allowed = currentCount < limit;

  return {
    allowed,
    currentCount,
    limit,
    period,
    message: allowed
      ? undefined
      : `Limit reached: ${currentCount}/${limit} tickets for this ${period} period.`,
  };
}

