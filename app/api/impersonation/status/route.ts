import { NextResponse } from "next/server";
import { getImpersonationContext, isImpersonating } from "@/modules/auth/impersonation";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const impersonating = await isImpersonating();
  
  if (!impersonating) {
    return NextResponse.json({ isImpersonating: false });
  }

  const context = await getImpersonationContext();
  if (!context) {
    return NextResponse.json({ isImpersonating: false });
  }

  // Get tenant name
  const supabase = createServiceRoleClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("id", context.tenantId)
    .single();

  return NextResponse.json({
    isImpersonating: true,
    tenantId: context.tenantId,
    tenantName: tenant?.name || null,
  });
}

