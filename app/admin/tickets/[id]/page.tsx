import { requireSuperAdmin } from "@/modules/auth/server";
import { getTicketByIdAdmin } from "@/modules/tickets/server-admin";
import { NotFoundError } from "@/lib/errors";
import { AdminTicketDetail } from "./admin-ticket-detail";
import { AnimatedPage } from "@/components/animated-page";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateMetadataForTicket } from "@/lib/metadata";
import { getAllTenants } from "@/modules/tenants/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<import("next").Metadata> {
  const { id } = await params;
  const ticket = await getTicketByIdAdmin(id);
  if (!ticket) {
    return {
      title: "Ticket Not Found - Ticket OS",
    };
  }
  
  const tenants = await getAllTenants();
  const tenant = tenants.find(t => t.id === ticket.tenant_id);
  const tenantName = tenant?.name;
  
  return generateMetadataForTicket(id, ticket.title, tenantName);
}

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;
  
  const ticket = await getTicketByIdAdmin(id);

  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div></div>
          <Link href="/admin/tickets">
            <Button variant="outline" className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              Back to Tickets
            </Button>
          </Link>
        </div>
        <AdminTicketDetail ticket={ticket} />
      </div>
    </AnimatedPage>
  );
}
