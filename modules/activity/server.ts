"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireTenantContext } from "@/modules/auth/server";
import * as queries from "./queries";

export interface LogActivityInput {
  tenantId: string;
  userId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any> | null;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("activity_logs").insert({
    tenant_id: input.tenantId,
    user_id: input.userId,
    action_type: input.actionType,
    entity_type: input.entityType,
    entity_id: input.entityId,
    metadata: input.metadata || null,
  });

  if (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - activity logging should not break the main operation
  }
}

export async function getActivityLogs(limit: number = 50) {
  const tenantId = await requireTenantContext();
  return queries.getTenantActivityLogs(tenantId, limit);
}

export async function getEntityActivityLogs(
  entityType: string,
  entityId: string
) {
  const tenantId = await requireTenantContext();
  return queries.getEntityActivityLogs(tenantId, entityType, entityId);
}
