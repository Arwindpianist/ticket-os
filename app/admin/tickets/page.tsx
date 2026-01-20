import { requireSuperAdmin } from "@/modules/auth/server";
import { Suspense } from "react";
import { TicketsContent } from "./tickets-content";

export default async function AdminTicketsPage() {
  await requireSuperAdmin();
  
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <TicketsContent />
    </Suspense>
  );
}
