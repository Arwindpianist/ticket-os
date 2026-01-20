import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/modules/auth/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    
    const supabase = createServiceRoleClient();
    const { data: contract, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch contract" },
      { status: 500 }
    );
  }
}
