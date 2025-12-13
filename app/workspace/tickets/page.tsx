import { requireAuth } from "@/modules/auth/server";
import { getTickets } from "@/modules/tickets/server";
import { isFeatureEnabled } from "@/modules/features/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AnimatedPage } from "@/components/animated-page";
import { TicketItem } from "./ticket-item";

export default async function TicketsPage() {
  await requireAuth();
  const ticketsEnabled = await isFeatureEnabled("tickets_enabled");
  
  if (!ticketsEnabled) {
    return (
      <AnimatedPage>
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Tickets feature is not enabled for your tenant.
            </CardContent>
          </Card>
        </div>
      </AnimatedPage>
    );
  }

  const tickets = await getTickets();

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
              Tickets
            </h1>
            <p className="text-muted-foreground text-lg">Manage and track support tickets</p>
          </div>
          <Link href="/workspace/tickets/new">
            <Button className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              Create Ticket
            </Button>
          </Link>
        </div>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-xl">All Tickets</CardTitle>
            <CardDescription>List of all tickets in your tenant</CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg mb-2">No tickets found.</p>
                <p className="text-sm">Create your first ticket to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket, index) => (
                  <TicketItem key={ticket.id} ticket={ticket} delay={index * 0.05} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}

