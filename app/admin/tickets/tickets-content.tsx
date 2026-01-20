import { getAllTicketsAdmin } from "@/modules/tickets/server-admin";
import { getAllTenants } from "@/modules/tenants/queries";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AnimatedPage } from "@/components/animated-page";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { TicketStatus, TicketPriority } from "@/types/database";
import { Ticket } from "@/types/ticket";
import { motion } from "framer-motion";
import { formatDate, formatDateTime } from "@/lib/utils";

// Server component with actual tickets list logic
export async function TicketsContent() {
  const tickets = await getAllTicketsAdmin();
  const tenants = await getAllTenants();
  
  // Create a map for quick tenant lookup
  const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
        return "secondary";
      case "waiting":
        return "outline";
      case "closed":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: TicketPriority) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Tickets
          </h1>
          <p className="text-muted-foreground text-lg">View and respond to tickets from all tenants</p>
        </div>

        <AnimatedCard delay={0.1} className="border border-border/30 bg-card shadow-depth-md">
          <AnimatedCardHeader>
            <CardTitle className="text-xl">All Tickets</CardTitle>
            <CardDescription>List of all tickets across all tenants</CardDescription>
          </AnimatedCardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg mb-2">No tickets found.</p>
                <p className="text-sm">Tickets created by tenants will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket, index) => {
                  const tenantName = tenantMap.get(ticket.tenant_id) || "Unknown Tenant";
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/admin/tickets/${ticket.id}`}>
                        <div className="flex items-center justify-between rounded-lg border p-4 shadow-inner-subtle hover:shadow-depth-sm transition-all duration-300 cursor-pointer">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold">{ticket.title}</span>
                              <Badge variant={getStatusBadgeVariant(ticket.status)}>
                                {ticket.status.replace("_", " ")}
                              </Badge>
                              <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge variant="outline">{tenantName}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Created: {formatDateTime(ticket.created_at)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
}
