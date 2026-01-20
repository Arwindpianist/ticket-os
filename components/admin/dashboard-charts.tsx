"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TicketStats, TicketTrend } from "@/modules/analytics/queries";

// Format date for chart display (consistent format)
function formatChartDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const COLORS = {
  open: "hsl(150, 25%, 45%)",
  in_progress: "hsl(150, 30%, 50%)",
  waiting: "hsl(150, 20%, 40%)",
  closed: "hsl(150, 15%, 35%)",
  created: "hsl(150, 25%, 45%)",
  resolved: "hsl(150, 15%, 35%)",
};

interface TicketStatusChartProps {
  stats: TicketStats;
}

export function TicketStatusChart({ stats }: TicketStatusChartProps) {
  const data = [
    { name: "Open", value: stats.open, color: COLORS.open },
    { name: "In Progress", value: stats.in_progress, color: COLORS.in_progress },
    { name: "Waiting", value: stats.waiting, color: COLORS.waiting },
    { name: "Closed", value: stats.closed, color: COLORS.closed },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No ticket data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface TicketTrendsChartProps {
  trends: TicketTrend[];
}

export function TicketTrendsChart({ trends }: TicketTrendsChartProps) {
  // Format dates for display (show last 14 days or all if less)
  const displayTrends = trends.slice(-14).map((trend) => ({
    ...trend,
    date: formatChartDate(trend.date),
  }));

  if (displayTrends.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={displayTrends}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Legend />
        <Bar dataKey="created" fill={COLORS.created} name="Created" />
        <Bar dataKey="resolved" fill={COLORS.resolved} name="Resolved" />
      </BarChart>
    </ResponsiveContainer>
  );
}
