import { createServiceRoleClient } from "@/lib/supabase/server";

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  waiting: number;
  closed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface SLAMetrics {
  averageResolutionTime: number; // in hours
  ticketsResolvedOnTime: number;
  ticketsResolvedLate: number;
  slaComplianceRate: number; // percentage
  averageResolutionTimeByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface TicketTrend {
  date: string;
  created: number;
  resolved: number;
}

// SLA targets in hours by priority
const SLA_TARGETS = {
  urgent: 4,
  high: 24,
  medium: 72,
  low: 168, // 7 days
};

export async function getAllTicketStats(): Promise<TicketStats> {
  const supabase = createServiceRoleClient();
  
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("status, priority");

  if (error) {
    throw new Error(`Failed to fetch ticket stats: ${error.message}`);
  }

  const stats: TicketStats = {
    total: tickets?.length || 0,
    open: 0,
    in_progress: 0,
    waiting: 0,
    closed: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
  };

  tickets?.forEach((ticket) => {
    switch (ticket.status) {
      case "open":
        stats.open++;
        break;
      case "in_progress":
        stats.in_progress++;
        break;
      case "waiting":
        stats.waiting++;
        break;
      case "closed":
        stats.closed++;
        break;
    }

    stats.byPriority[ticket.priority as keyof typeof stats.byPriority]++;
  });

  return stats;
}

export async function getSLAMetrics(): Promise<SLAMetrics> {
  const supabase = createServiceRoleClient();
  
  // Get all resolved tickets with resolution times
  const { data: resolvedTickets, error } = await supabase
    .from("tickets")
    .select("priority, created_at, resolved_at")
    .not("resolved_at", "is", null);

  if (error) {
    throw new Error(`Failed to fetch SLA metrics: ${error.message}`);
  }

  if (!resolvedTickets || resolvedTickets.length === 0) {
    return {
      averageResolutionTime: 0,
      ticketsResolvedOnTime: 0,
      ticketsResolvedLate: 0,
      slaComplianceRate: 0,
      averageResolutionTimeByPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
      },
    };
  }

  let totalResolutionTime = 0;
  let resolvedOnTime = 0;
  let resolvedLate = 0;
  const resolutionTimesByPriority: Record<string, number[]> = {
    low: [],
    medium: [],
    high: [],
    urgent: [],
  };

  resolvedTickets.forEach((ticket) => {
    const created = new Date(ticket.created_at).getTime();
    const resolved = new Date(ticket.resolved_at).getTime();
    const resolutionTimeHours = (resolved - created) / (1000 * 60 * 60);
    
    totalResolutionTime += resolutionTimeHours;
    
    const slaTarget = SLA_TARGETS[ticket.priority as keyof typeof SLA_TARGETS];
    if (resolutionTimeHours <= slaTarget) {
      resolvedOnTime++;
    } else {
      resolvedLate++;
    }

    resolutionTimesByPriority[ticket.priority].push(resolutionTimeHours);
  });

  const averageResolutionTime = totalResolutionTime / resolvedTickets.length;
  const slaComplianceRate = (resolvedOnTime / resolvedTickets.length) * 100;

  const averageResolutionTimeByPriority = {
    low: resolutionTimesByPriority.low.length > 0
      ? resolutionTimesByPriority.low.reduce((a, b) => a + b, 0) / resolutionTimesByPriority.low.length
      : 0,
    medium: resolutionTimesByPriority.medium.length > 0
      ? resolutionTimesByPriority.medium.reduce((a, b) => a + b, 0) / resolutionTimesByPriority.medium.length
      : 0,
    high: resolutionTimesByPriority.high.length > 0
      ? resolutionTimesByPriority.high.reduce((a, b) => a + b, 0) / resolutionTimesByPriority.high.length
      : 0,
    urgent: resolutionTimesByPriority.urgent.length > 0
      ? resolutionTimesByPriority.urgent.reduce((a, b) => a + b, 0) / resolutionTimesByPriority.urgent.length
      : 0,
  };

  return {
    averageResolutionTime,
    ticketsResolvedOnTime: resolvedOnTime,
    ticketsResolvedLate: resolvedLate,
    slaComplianceRate,
    averageResolutionTimeByPriority,
  };
}

export async function getTicketTrends(days: number = 30): Promise<TicketTrend[]> {
  const supabase = createServiceRoleClient();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("created_at, resolved_at")
    .gte("created_at", startDate.toISOString());

  if (error) {
    throw new Error(`Failed to fetch ticket trends: ${error.message}`);
  }

  // Group by date
  const trendsMap = new Map<string, { created: number; resolved: number }>();
  
  // Initialize all dates in range
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    trendsMap.set(dateKey, { created: 0, resolved: 0 });
  }

  tickets?.forEach((ticket) => {
    const createdDate = new Date(ticket.created_at).toISOString().split("T")[0];
    const existing = trendsMap.get(createdDate) || { created: 0, resolved: 0 };
    existing.created++;
    trendsMap.set(createdDate, existing);

    if (ticket.resolved_at) {
      const resolvedDate = new Date(ticket.resolved_at).toISOString().split("T")[0];
      const resolved = trendsMap.get(resolvedDate) || { created: 0, resolved: 0 };
      resolved.resolved++;
      trendsMap.set(resolvedDate, resolved);
    }
  });

  // Convert to array and sort by date
  const trends: TicketTrend[] = Array.from(trendsMap.entries())
    .map(([date, data]) => ({
      date,
      created: data.created,
      resolved: data.resolved,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return trends;
}

