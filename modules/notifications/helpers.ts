"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Get all user emails in a tenant (excluding the current user)
 */
export async function getTenantUserEmails(
  tenantId: string,
  excludeUserId?: string
): Promise<string[]> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("profiles")
    .select("email")
    .eq("tenant_id", tenantId);

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch tenant user emails:", error);
    return [];
  }

  return data.map((profile) => profile.email).filter(Boolean);
}

/**
 * Get email for a specific user
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch user email:", error);
    return null;
  }

  return data.email;
}


