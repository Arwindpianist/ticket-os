"use server";

import { requireSuperAdmin } from "./server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ValidationError } from "@/lib/errors";

const IMPERSONATION_COOKIE = "impersonation_tenant_id";
const IMPERSONATION_USER_COOKIE = "impersonation_user_id";

export async function startImpersonation(tenantId: string): Promise<void> {
  await requireSuperAdmin();
  
  // Verify tenant exists
  const supabase = createServiceRoleClient();
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("id", tenantId)
    .single();

  if (error || !tenant) {
    throw new ValidationError("Tenant not found");
  }

  // Get a user from this tenant to use as the impersonation context
  const { data: tenantUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("tenant_id", tenantId)
    .limit(1)
    .single();

  if (!tenantUser) {
    throw new ValidationError("No users found in this tenant");
  }

  // Set impersonation cookies
  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE, tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 hours
  });
  cookieStore.set(IMPERSONATION_USER_COOKIE, tenantUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 hours
  });

  // Log impersonation start
  const session = await requireSuperAdmin();
  await supabase.from("activity_logs").insert({
    tenant_id: tenantId,
    user_id: session.user.id,
    action_type: "impersonation_started",
    entity_type: "tenant",
    entity_id: tenantId,
    metadata: { tenant_name: tenant.name },
  });
}

export async function stopImpersonation(): Promise<void> {
  await requireSuperAdmin();
  
  const cookieStore = await cookies();
  const tenantId = cookieStore.get(IMPERSONATION_COOKIE)?.value;
  
  cookieStore.delete(IMPERSONATION_COOKIE);
  cookieStore.delete(IMPERSONATION_USER_COOKIE);

  // Log impersonation end
  if (tenantId) {
    const supabase = createServiceRoleClient();
    const session = await requireSuperAdmin();
    await supabase.from("activity_logs").insert({
      tenant_id: tenantId,
      user_id: session.user.id,
      action_type: "impersonation_ended",
      entity_type: "tenant",
      entity_id: tenantId,
      metadata: {},
    });
  }
}

export async function getImpersonationContext(): Promise<{
  tenantId: string | null;
  userId: string | null;
} | null> {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get(IMPERSONATION_COOKIE)?.value || null;
  const userId = cookieStore.get(IMPERSONATION_USER_COOKIE)?.value || null;

  if (!tenantId || !userId) {
    return null;
  }

  return { tenantId, userId };
}

export async function isImpersonating(): Promise<boolean> {
  const context = await getImpersonationContext();
  return context !== null;
}

