"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/modules/auth/server";
import { requireTenantContext } from "@/modules/auth/server";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { CreateContractInput, UpdateContractInput, Contract } from "./types";
import * as queries from "./queries";
import { logActivity } from "@/modules/activity/server";

export async function createContract(input: CreateContractInput): Promise<Contract> {
  await requireSuperAdmin();

  // Validate dates
  const startDate = new Date(input.start_date);
  const endDate = new Date(input.end_date);
  if (endDate <= startDate) {
    throw new ValidationError("End date must be after start date");
  }

  const session = await requireSuperAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("contracts")
    .insert({
      tenant_id: input.tenant_id,
      title: input.title,
      summary: input.summary,
      pdf_url: input.pdf_url || null,
      start_date: input.start_date,
      end_date: input.end_date,
      created_by: session.user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create contract: ${error.message}`);
  }

  // Log activity
  await logActivity({
    tenantId: input.tenant_id,
    userId: session.user.id,
    actionType: "contract_created",
    entityType: "contract",
    entityId: data.id,
    metadata: { title: data.title },
  });

  return data;
}

export async function getContract(contractId: string): Promise<Contract | null> {
  const tenantId = await requireTenantContext();
  return queries.getContractById(contractId, tenantId);
}

export async function getContracts(): Promise<Contract[]> {
  const tenantId = await requireTenantContext();
  return queries.getTenantContracts(tenantId);
}

export async function getAllContracts(): Promise<Contract[]> {
  await requireSuperAdmin();
  return queries.getAllContracts();
}

export async function updateContract(
  contractId: string,
  input: UpdateContractInput
): Promise<Contract> {
  await requireSuperAdmin();
  const session = await requireSuperAdmin();

  // Get existing contract to validate tenant
  const supabase = createServiceRoleClient();
  const { data: existing, error: fetchError } = await supabase
    .from("contracts")
    .select("tenant_id, start_date, end_date")
    .eq("id", contractId)
    .single();

  if (fetchError || !existing) {
    throw new NotFoundError("Contract not found");
  }

  // Validate dates if both are provided
  if (input.start_date && input.end_date) {
    const startDate = new Date(input.start_date);
    const endDate = new Date(input.end_date);
    if (endDate <= startDate) {
      throw new ValidationError("End date must be after start date");
    }
  } else if (input.start_date) {
    const startDate = new Date(input.start_date);
    const endDate = new Date(existing.end_date);
    if (endDate <= startDate) {
      throw new ValidationError("End date must be after start date");
    }
  } else if (input.end_date) {
    const startDate = new Date(existing.start_date);
    const endDate = new Date(input.end_date);
    if (endDate <= startDate) {
      throw new ValidationError("End date must be after start date");
    }
  }

  const updateData: any = {};
  if (input.title) updateData.title = input.title;
  if (input.summary) updateData.summary = input.summary;
  if (input.pdf_url !== undefined) updateData.pdf_url = input.pdf_url;
  if (input.start_date) updateData.start_date = input.start_date;
  if (input.end_date) updateData.end_date = input.end_date;

  const { data, error } = await supabase
    .from("contracts")
    .update(updateData)
    .eq("id", contractId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update contract: ${error.message}`);
  }

  // Log activity
  await logActivity({
    tenantId: existing.tenant_id,
    userId: session.user.id,
    actionType: "contract_updated",
    entityType: "contract",
    entityId: contractId,
  });

  return data;
}

