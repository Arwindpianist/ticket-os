import { requireSuperAdmin } from "@/modules/auth/server";
import { getAllTenants } from "@/modules/tenants/queries";
import { getTicketStats, getSLAMetrics, getTicketTrends } from "@/modules/analytics/server";
import { AnimatedCard, AnimatedCardHeader, CardContent, CardDescription, CardTitle } from "@/components/animated-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";
import { TicketStatusChart, TicketTrendsChart } from "@/components/admin/dashboard-charts";
import { SLACard } from "@/components/admin/sla-card";
import { generateMetadataForPath } from "@/lib/metadata";

export function generateMetadata() {
  return generateMetadataForPath("/admin", "Admin Dashboard - Ticket OS", "Manage tenants, users, tickets, and system analytics");
}

export default async function AdminDashboard() {
  await requireSuperAdmin();
  const tenants = await getAllTenants();
  const ticketStats = await getTicketStats();
  const slaMetrics = await getSLAMetrics();
  const ticketTrends = await getTicketTrends(30);

  const activeTenants = tenants.filter((t) => t.is_active).length;
  const suspendedTenants = tenants.filter((t) => !t.is_active).length;

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-foreground via-primary/30 to-foreground/80 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Manage tenants, users, and system analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <AnimatedCard delay={0.1}>
            <AnimatedCardHeader>
              <CardTitle className="text-xl">Tenants</CardTitle>
              <CardDescription>Total registered tenants</CardDescription>
            </AnimatedCardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{tenants.length}</div>
              <div className="text-sm text-muted-foreground mb-4">
                {activeTenants} active, {suspendedTenants} suspended
              </div>
              <Link href="/admin/tenants" className="block">
                <Button variant="outline" className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  Manage Tenants
                </Button>
              </Link>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <AnimatedCardHeader>
              <CardTitle className="text-xl">Total Tickets</CardTitle>
              <CardDescription>All tickets across tenants</CardDescription>
            </AnimatedCardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{ticketStats.total}</div>
              <div className="text-sm text-muted-foreground">
                {ticketStats.closed} closed, {ticketStats.open + ticketStats.in_progress + ticketStats.waiting} active
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.3}>
            <AnimatedCardHeader>
              <CardTitle className="text-xl">SLA Compliance</CardTitle>
              <CardDescription>Resolution time compliance</CardDescription>
            </AnimatedCardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">{slaMetrics.slaComplianceRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">
                {slaMetrics.ticketsResolvedOnTime} on time, {slaMetrics.ticketsResolvedLate} late
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <AnimatedCardHeader>
              <CardTitle className="text-xl">Avg Resolution</CardTitle>
              <CardDescription>Average ticket resolution time</CardDescription>
            </AnimatedCardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2">
                {slaMetrics.averageResolutionTime > 0 
                  ? `${(slaMetrics.averageResolutionTime / 24).toFixed(1)}d`
                  : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">
                Across all priorities
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <AnimatedCard delay={0.5}>
            <AnimatedCardHeader>
              <CardTitle className="text-xl">Ticket Status Distribution</CardTitle>
              <CardDescription>Current ticket status breakdown</CardDescription>
            </AnimatedCardHeader>
            <CardContent>
              <TicketStatusChart stats={ticketStats} />
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={0.6}>
            <AnimatedCardHeader>
              <CardTitle className="text-xl">Ticket Trends (30 Days)</CardTitle>
              <CardDescription>Created vs resolved tickets</CardDescription>
            </AnimatedCardHeader>
            <CardContent>
              <TicketTrendsChart trends={ticketTrends} />
            </CardContent>
          </AnimatedCard>
        </div>

        {/* SLA Metrics */}
        <AnimatedCard delay={0.7}>
          <AnimatedCardHeader>
            <CardTitle className="text-xl">SLA Performance by Priority</CardTitle>
            <CardDescription>Average resolution times and compliance rates</CardDescription>
          </AnimatedCardHeader>
          <CardContent>
            <SLACard metrics={slaMetrics} />
          </CardContent>
        </AnimatedCard>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/admin/users">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <span className="text-lg">👥</span>
              <span>Manage Users</span>
            </Button>
          </Link>
          <Link href="/admin/tenants">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <span className="text-lg">🏢</span>
              <span>Manage Tenants</span>
            </Button>
          </Link>
          <Link href="/admin/contracts">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <span className="text-lg">📄</span>
              <span>View Contracts</span>
            </Button>
          </Link>
        </div>
      </div>
    </AnimatedPage>
  );
}
