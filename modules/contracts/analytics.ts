"use server";

import { createClient } from "@/lib/supabase/server";
import { requireTenantContext } from "@/modules/auth/server";
import { getContracts } from "./server";
import { ContractItem } from "@/components/contract-builder";

export interface ContractItemUsage {
  contractItemId: string;
  contractId: string;
  contractTitle: string;
  itemText: string;
  itemType: string;
  ticketCount: number;
  limit?: number;
  limitPeriod?: "monthly" | "quarterly" | "half_yearly" | "yearly" | null;
  usagePercentage: number;
  isAtLimit: boolean;
  isNearLimit: boolean; // Within 80% of limit
}

export interface ContractItemUsageStats {
  totalItems: number;
  itemsWithLimits: number;
  itemsAtLimit: number;
  itemsNearLimit: number;
  totalTickets: number;
  usageByItem: ContractItemUsage[];
}

/**
 * Get usage statistics for all contract items in active contracts
 */
export async function getContractItemUsageStats(): Promise<ContractItemUsageStats> {
  await requireTenantContext();
  const supabase = createClient();
  const contracts = await getContracts();
  const today = new Date();

  // Filter to only active contracts
  const activeContracts = contracts.filter((contract) => {
    const start = new Date(contract.start_date);
    const end = new Date(contract.end_date);
    return today >= start && today <= end;
  });

  const usageByItem: ContractItemUsage[] = [];
  let totalTickets = 0;
  let itemsWithLimits = 0;
  let itemsAtLimit = 0;
  let itemsNearLimit = 0;

  for (const contract of activeContracts) {
    const summary = contract.summary as any;
    if (!summary?.items || !Array.isArray(summary.items)) {
      continue;
    }

    const items = summary.items as ContractItem[];

    for (const item of items) {
      // Skip plain text items
      if (item.type === "text" || !item.text) {
        continue;
      }

      const contractItemId = `${contract.id}-${item.id}`;
      const hasLimit = item.type === "limit" && item.value;
      const limit = hasLimit ? (item.value as number) : undefined;
      const limitPeriod = item.limit_period || "monthly";

      // Calculate period start date
      let periodStart: Date;
      switch (limitPeriod) {
        case "monthly":
          periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case "quarterly":
          const quarter = Math.floor(today.getMonth() / 3);
          periodStart = new Date(today.getFullYear(), quarter * 3, 1);
          break;
        case "half_yearly":
          const half = Math.floor(today.getMonth() / 6);
          periodStart = new Date(today.getFullYear(), half * 6, 1);
          break;
        case "yearly":
          periodStart = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
      }

      // Count tickets for this contract item in the current period
      const { count, error } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("contract_item_id", contractItemId)
        .gte("created_at", periodStart.toISOString());

      if (error) {
        console.error(`Failed to count tickets for ${contractItemId}:`, error);
        continue;
      }

      const ticketCount = count || 0;
      totalTickets += ticketCount;

      const usagePercentage = limit ? (ticketCount / limit) * 100 : 0;
      const isAtLimit = limit ? ticketCount >= limit : false;
      const isNearLimit = limit ? usagePercentage >= 80 && !isAtLimit : false;

      if (hasLimit) {
        itemsWithLimits++;
        if (isAtLimit) itemsAtLimit++;
        if (isNearLimit) itemsNearLimit++;
      }

      usageByItem.push({
        contractItemId,
        contractId: contract.id,
        contractTitle: contract.title,
        itemText: item.text,
        itemType: item.type,
        ticketCount,
        limit,
        limitPeriod,
        usagePercentage,
        isAtLimit,
        isNearLimit,
      });
    }
  }

  // Sort by usage percentage (highest first) or ticket count
  usageByItem.sort((a, b) => {
    if (a.limit && b.limit) {
      return b.usagePercentage - a.usagePercentage;
    }
    return b.ticketCount - a.ticketCount;
  });

  return {
    totalItems: usageByItem.length,
    itemsWithLimits,
    itemsAtLimit,
    itemsNearLimit,
    totalTickets,
    usageByItem,
  };
}

/**
 * Get usage trend for a specific contract item over time
 */
export async function getContractItemUsageTrend(
  contractItemId: string,
  days: number = 30
): Promise<Array<{ date: string; count: number }>> {
  await requireTenantContext();
  const supabase = createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("created_at")
    .eq("contract_item_id", contractItemId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch usage trend: ${error.message}`);
  }

  // Group by date
  const trendMap = new Map<string, number>();
  const today = new Date();

  // Initialize all dates in range with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    const dateKey = date.toISOString().split("T")[0];
    trendMap.set(dateKey, 0);
  }

  // Count tickets per date
  tickets?.forEach((ticket) => {
    const dateKey = ticket.created_at.split("T")[0];
    const current = trendMap.get(dateKey) || 0;
    trendMap.set(dateKey, current + 1);
  });

  // Convert to array
  return Array.from(trendMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

