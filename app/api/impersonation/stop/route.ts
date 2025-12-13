import { NextResponse } from "next/server";
import { stopImpersonation } from "@/modules/auth/impersonation";

export async function POST() {
  try {
    await stopImpersonation();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to stop impersonation" },
      { status: 500 }
    );
  }
}

