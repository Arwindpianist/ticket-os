"use server";

import { getContracts } from "./server";
import { ContractItem } from "@/components/contract-builder";
import { requireTenantContext } from "@/modules/auth/server";

export interface ContractItemOption {
  id: string;
  text: string;
  contractId: string;
  contractTitle: string;
  hasLimit: boolean;
  limitValue?: number;
  limitPeriod?: "monthly" | "quarterly" | "half_yearly" | "yearly" | null;
}

/**
 * Get all contract items from active contracts for the current tenant
 * Returns items that can be used as ticket types
 */
export async function getContractItemOptions(): Promise<ContractItemOption[]> {
  await requireTenantContext(); // Ensure user has tenant context
  const contracts = await getContracts();
  const today = new Date();
  
  // Filter to only active contracts
  const activeContracts = contracts.filter(contract => {
    const start = new Date(contract.start_date);
    const end = new Date(contract.end_date);
    return today >= start && today <= end;
  });

  const options: ContractItemOption[] = [];

  for (const contract of activeContracts) {
    // Parse contract summary to extract items
    const summary = contract.summary as any;
    if (summary?.items && Array.isArray(summary.items)) {
      const items = summary.items as ContractItem[];
      
      for (const item of items) {
        // Only include items that are not just plain text (they should be actionable)
        if (item.type !== "text" && item.text) {
          options.push({
            id: `${contract.id}-${item.id}`,
            text: item.text,
            contractId: contract.id,
            contractTitle: contract.title,
            hasLimit: item.type === "limit",
            limitValue: item.type === "limit" ? (item.value as number) : undefined,
            limitPeriod: item.limit_period || "monthly",
          });
        }
      }
    }
  }

  return options;
}

