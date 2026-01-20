import { requireAuth } from "@/modules/auth/server";
import { getTicket } from "@/modules/tickets/server";
import { NotFoundError } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { TicketDetail } from "./ticket-detail";
import { AnimatedPage } from "@/components/animated-page";
import { getEntityActivityLogs } from "@/modules/activity/server";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { isFeatureEnabled } from "@/modules/features/server";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import { generateMetadataForTicket } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<import("next").Metadata> {
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) {
    return {
      title: "Ticket Not Found - Ticket OS",
    };
  }
  
  return generateMetadataForTicket(id, ticket.title);
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const ticket = await getTicket(id);
  const activityFeedEnabled = await isFeatureEnabled("activity_feed_enabled");

  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }

  // Fetch activity logs for this ticket if enabled
  const activities = activityFeedEnabled 
    ? await getEntityActivityLogs("ticket", id)
    : [];

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            {ticket.title}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant={
                ticket.status === "closed"
                  ? "secondary"
                  : ticket.status === "open"
                  ? "default"
                  : "outline"
              }
            >
              {ticket.status}
            </Badge>
            <Badge variant="outline">{ticket.priority}</Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TicketDetail ticket={ticket} />
          </div>

          {activityFeedEnabled && activities.length > 0 && (
            <AnimatedCard delay={0.2}>
              <AnimatedCardHeader>
                <CardTitle className="text-xl">Ticket Activity</CardTitle>
                <CardDescription>History of changes and updates</CardDescription>
              </AnimatedCardHeader>
              <CardContent>
                <ActivityFeed activities={activities} showEntityLinks={false} />
              </CardContent>
            </AnimatedCard>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

