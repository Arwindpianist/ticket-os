import { createClient } from "@/lib/supabase/server";

export interface ActivityLog {
  id: string;
  tenant_id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any> | null;
  created_at: string;
  user?: {
    email: string;
  };
}

export async function getTenantActivityLogs(
  tenantId: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  const supabase = createClient();
  
  // First get activity logs
  const { data: logs, error: logsError } = await supabase
    .from("activity_logs")
    .select("id, tenant_id, user_id, action_type, entity_type, entity_id, metadata, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (logsError) {
    throw new Error(`Failed to fetch activity logs: ${logsError.message}`);
  }

  if (!logs || logs.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(logs.map(log => log.user_id))];
  
  // Fetch user emails
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  // Create a map of user_id -> email
  const userMap = new Map((profiles || []).map(p => [p.id, p.email]));

  // Combine logs with user emails
  return logs.map((log) => ({
    id: log.id,
    tenant_id: log.tenant_id,
    user_id: log.user_id,
    action_type: log.action_type,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    metadata: log.metadata,
    created_at: log.created_at,
    user: userMap.has(log.user_id) ? { email: userMap.get(log.user_id)! } : undefined,
  }));
}

export async function getEntityActivityLogs(
  tenantId: string,
  entityType: string,
  entityId: string
): Promise<ActivityLog[]> {
  const supabase = createClient();
  
  // First get activity logs
  const { data: logs, error: logsError } = await supabase
    .from("activity_logs")
    .select("id, tenant_id, user_id, action_type, entity_type, entity_id, metadata, created_at")
    .eq("tenant_id", tenantId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (logsError) {
    throw new Error(`Failed to fetch entity activity logs: ${logsError.message}`);
  }

  if (!logs || logs.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(logs.map(log => log.user_id))];
  
  // Fetch user emails
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  // Create a map of user_id -> email
  const userMap = new Map((profiles || []).map(p => [p.id, p.email]));

  // Combine logs with user emails
  return logs.map((log) => ({
    id: log.id,
    tenant_id: log.tenant_id,
    user_id: log.user_id,
    action_type: log.action_type,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    metadata: log.metadata,
    created_at: log.created_at,
    user: userMap.has(log.user_id) ? { email: userMap.get(log.user_id)! } : undefined,
  }));
}

