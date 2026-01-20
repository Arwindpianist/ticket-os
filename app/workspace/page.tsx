import { requireAuth, getAuthContext } from "@/modules/auth/server";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isFeatureEnabled } from "@/modules/features/server";
import { AnimatedPage } from "@/components/animated-page";
import { getActivityLogs } from "@/modules/activity/server";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { getTickets } from "@/modules/tickets/server";
import { getContracts } from "@/modules/contracts/server";
import { getTenantBranding } from "@/modules/branding/queries";
import { getContractItemUsageStats } from "@/modules/contracts/analytics";
import { ContractItemUsageSummary } from "@/components/contracts/contract-item-usage-summary";
import { AlertTriangle, TrendingUp, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TenantLogo } from "@/components/branding/tenant-logo";
import { generateMetadataForPath } from "@/lib/metadata";

export function generateMetadata() {
  return generateMetadataForPath("/workspace");
}

export default async function WorkspacePage() {
  const authContext = await getAuthContext();
  
  if (!authContext?.tenantId) {
    return (
      <AnimatedPage>
        <div className="container mx-auto py-8 px-4">
          <AnimatedCard delay={0.1}>
            <CardContent className="py-8 text-center text-muted-foreground">
              You are not associated with a tenant. Please contact your administrator.
            </CardContent>
          </AnimatedCard>
        </div>
      </AnimatedPage>
    );
  }

  const ticketsEnabled = await isFeatureEnabled("tickets_enabled", authContext.tenantId);
  const contractsEnabled = await isFeatureEnabled("contracts_enabled", authContext.tenantId);
  const activityFeedEnabled = await isFeatureEnabled("activity_feed_enabled", authContext.tenantId);
  
  // Fetch data
  const tickets = ticketsEnabled ? await getTickets() : [];
  const contracts = contractsEnabled ? await getContracts() : [];
  const activities = activityFeedEnabled ? await getActivityLogs(10) : [];
  
  // Fetch contract item usage stats if contracts are enabled
  let contractItemStats = null;
  try {
    if (contractsEnabled) {
      contractItemStats = await getContractItemUsageStats();
    }
  } catch (error) {
    console.error("Failed to fetch contract item usage stats:", error);
    // Continue without stats - not critical
  }

  // Calculate stats
  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    in_progress: tickets.filter(t => t.status === "in_progress").length,
    closed: tickets.filter(t => t.status === "closed").length,
  };

  const activeContracts = contracts.filter(c => {
    const today = new Date();
    const start = new Date(c.start_date);
    const end = new Date(c.end_date);
    return today >= start && today <= end;
  }).length;

  // Get branding for dashboard title, welcome message, and logo
  const branding = await getTenantBranding(authContext.tenantId);
  const dashboardTitle = branding?.dashboard_title || "Workspace";
  const welcomeMessage = branding?.welcome_message;
  const logoUrl = branding?.logo_url;

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
              {dashboardTitle}
            </h1>
            {welcomeMessage ? (
              <p className="text-muted-foreground text-lg">{welcomeMessage}</p>
            ) : (
              <p className="text-muted-foreground text-lg">Your dashboard</p>
            )}
          </div>
          {logoUrl && (
            <TenantLogo logoUrl={logoUrl} alt={`${dashboardTitle} Logo`} />
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {ticketsEnabled && (
            <>
              <AnimatedCard delay={0.1}>
                <AnimatedCardHeader>
                  <CardTitle className="text-xl">Total Tickets</CardTitle>
                  <CardDescription>All tickets</CardDescription>
                </AnimatedCardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{ticketStats.total}</div>
                  <div className="text-sm text-muted-foreground">
                    {ticketStats.open} open, {ticketStats.in_progress} in progress
                  </div>
                </CardContent>
              </AnimatedCard>
              <AnimatedCard delay={0.2}>
                <AnimatedCardHeader>
                  <CardTitle className="text-xl">Open Tickets</CardTitle>
                  <CardDescription>Requiring attention</CardDescription>
                </AnimatedCardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{ticketStats.open}</div>
                  <div className="text-sm text-muted-foreground">
                    {ticketStats.in_progress} in progress
                  </div>
                </CardContent>
              </AnimatedCard>
            </>
          )}
          {contractsEnabled && (
            <>
              <AnimatedCard delay={0.3}>
                <AnimatedCardHeader>
                  <CardTitle className="text-xl">Active Contracts</CardTitle>
                  <CardDescription>Current contracts</CardDescription>
                </AnimatedCardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{activeContracts}</div>
                  <div className="text-sm text-muted-foreground">
                    {contracts.length} total contracts
                  </div>
                </CardContent>
              </AnimatedCard>
              {contractItemStats && (
                <AnimatedCard 
                  delay={0.4}
                  className={cn(
                    contractItemStats.itemsAtLimit > 0 && "border-destructive/50"
                  )}
                >
                  <AnimatedCardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      Contract Items
                      {contractItemStats.itemsAtLimit > 0 && (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                    </CardTitle>
                    <CardDescription>Usage & limits</CardDescription>
                  </AnimatedCardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold mb-2">
                      {contractItemStats.totalItems}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {contractItemStats.itemsAtLimit > 0 && (
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          {contractItemStats.itemsAtLimit} at limit
                        </div>
                      )}
                      {contractItemStats.itemsNearLimit > 0 && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <AlertTriangle className="h-3 w-3" />
                          {contractItemStats.itemsNearLimit} near limit
                        </div>
                      )}
                      {contractItemStats.itemsAtLimit === 0 && contractItemStats.itemsNearLimit === 0 && (
                        <div className="flex items-center gap-1 text-primary">
                          <CheckCircle2 className="h-3 w-3" />
                          All within limits
                        </div>
                      )}
                    </div>
                  </CardContent>
                </AnimatedCard>
              )}
            </>
          )}
        </div>

        {/* Contract Item Usage Section */}
        {contractsEnabled && contractItemStats && contractItemStats.totalItems > 0 && (
          <AnimatedCard delay={0.4} className="mb-8 border border-border/30 bg-card shadow-depth-md">
            <AnimatedCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Contract Item Usage</CardTitle>
                  <CardDescription>Track usage against contract limits</CardDescription>
                </div>
                <Link href="/workspace/contracts/usage">
                  <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                    View Details
                  </Button>
                </Link>
              </div>
            </AnimatedCardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contractItemStats.usageByItem.slice(0, 6).map((item) => (
                  <div
                    key={item.contractItemId}
                    className={cn(
                      "rounded-lg border p-4 transition-all duration-300 hover:shadow-depth-sm",
                      item.isAtLimit && "border-destructive/50 bg-destructive/5",
                      item.isNearLimit && "border-yellow-500/50 bg-yellow-500/5",
                      !item.isAtLimit && !item.isNearLimit && "border-border/30 bg-card shadow-inner-subtle"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm line-clamp-2 flex-1">{item.itemText}</h4>
                      {item.isAtLimit && (
                        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 ml-2" />
                      )}
                      {item.isNearLimit && !item.isAtLimit && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Tickets</span>
                      <span className="font-semibold">
                        {item.ticketCount}
                        {item.limit && ` / ${item.limit}`}
                      </span>
                    </div>
                    {item.limit && (
                      <div className="space-y-1">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              item.usagePercentage >= 100 && "bg-destructive",
                              item.usagePercentage >= 80 && item.usagePercentage < 100 && "bg-yellow-500",
                              item.usagePercentage < 80 && "bg-primary"
                            )}
                            style={{ width: `${Math.min(item.usagePercentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {item.limitPeriod === "monthly" && "This month"}
                            {item.limitPeriod === "quarterly" && "This quarter"}
                            {item.limitPeriod === "half_yearly" && "This half-year"}
                            {item.limitPeriod === "yearly" && "This year"}
                          </span>
                          <span className={cn(
                            "font-medium",
                            item.usagePercentage >= 100 && "text-destructive",
                            item.usagePercentage >= 80 && item.usagePercentage < 100 && "text-yellow-500"
                          )}>
                            {item.usagePercentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                    {!item.limit && (
                      <div className="text-xs text-muted-foreground">
                        {item.itemType === "unlimited" ? "Unlimited" : "No limit"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {contractItemStats.usageByItem.length > 6 && (
                <div className="mt-4 text-center">
                  <Link href="/workspace/contracts/usage">
                    <Button variant="ghost" className="transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      View All {contractItemStats.totalItems} Items
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
            {ticketsEnabled && (
              <AnimatedCard delay={0.5}>
                <AnimatedCardHeader>
                  <CardTitle className="text-xl">Tickets</CardTitle>
                  <CardDescription>Manage support tickets</CardDescription>
                </AnimatedCardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className="flex gap-2">
                      <Badge variant={ticketStats.open > 0 ? "default" : "secondary"}>
                        {ticketStats.open} Open
                      </Badge>
                      <Badge variant={ticketStats.in_progress > 0 ? "default" : "secondary"}>
                        {ticketStats.in_progress} In Progress
                      </Badge>
                    </div>
                  </div>
                  <Link href="/workspace/tickets">
                    <Button variant="outline" className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      View All Tickets
                    </Button>
                  </Link>
                  <Link href="/workspace/tickets/new">
                    <Button className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      Create New Ticket
                    </Button>
                  </Link>
                </CardContent>
              </AnimatedCard>
            )}

            {contractsEnabled && (
              <AnimatedCard delay={0.6}>
                <AnimatedCardHeader>
                  <CardTitle className="text-xl">Contracts</CardTitle>
                  <CardDescription>View your contracts</CardDescription>
                </AnimatedCardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <Badge variant={activeContracts > 0 ? "default" : "secondary"}>
                      {activeContracts} Active
                    </Badge>
                  </div>
                  <Link href="/workspace/contracts">
                    <Button variant="outline" className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      View All Contracts
                    </Button>
                  </Link>
                  {contractItemStats && contractItemStats.itemsAtLimit > 0 && (
                    <Link href="/workspace/contracts/usage">
                      <Button variant="destructive" className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Review Limits ({contractItemStats.itemsAtLimit})
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </AnimatedCard>
            )}
          </div>

          {activityFeedEnabled && (
            <AnimatedCard delay={0.7}>
              <AnimatedCardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>Latest actions and updates</CardDescription>
              </AnimatedCardHeader>
              <CardContent>
                <ActivityFeed activities={activities} />
              </CardContent>
            </AnimatedCard>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

