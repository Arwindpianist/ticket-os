import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { AuthError, ForbiddenError } from "@/lib/errors";
import { UserRole } from "@/types/database";
import { AuthContext, Session } from "./types";
import { getImpersonationContext } from "./impersonation";

export async function getServerSession(): Promise<Session | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role, tenant_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      tenant_id: profile.tenant_id,
    },
  };
}

export async function requireAuth(): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    throw new AuthError("Authentication required");
  }
  return session;
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<Session> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError(
      `Access denied. Required roles: ${allowedRoles.join(", ")}`
    );
  }
  return session;
}

export async function requireSuperAdmin(): Promise<Session> {
  return requireRole(["super_admin"]);
}

export async function requireTenantAdmin(): Promise<Session> {
  return requireRole(["super_admin", "tenant_admin"]);
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getServerSession();
  if (!session) {
    return null;
  }

  // Check for impersonation (only for super_admin)
  const impersonation = session.user.role === "super_admin" 
    ? await getImpersonationContext()
    : null;

  return {
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    tenantId: impersonation?.tenantId || session.user.tenant_id,
    isImpersonating: impersonation !== null,
  };
}

export async function getTenantContext(): Promise<string | null> {
  const context = await getAuthContext();
  return context?.tenantId ?? null;
}

export async function requireTenantContext(): Promise<string> {
  const tenantId = await getTenantContext();
  if (!tenantId) {
    throw new ForbiddenError("Tenant context required");
  }
  return tenantId;
}

