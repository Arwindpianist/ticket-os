"use client";

import { SLAMetrics } from "@/modules/analytics/queries";
import { Badge } from "@/components/ui/badge";

interface SLACardProps {
  metrics: SLAMetrics;
}

const SLA_TARGETS = {
  urgent: 4,
  high: 24,
  medium: 72,
  low: 168,
};

export function SLACard({ metrics }: SLACardProps) {
  const priorities = [
    { key: "urgent" as const, label: "Urgent", target: SLA_TARGETS.urgent },
    { key: "high" as const, label: "High", target: SLA_TARGETS.high },
    { key: "medium" as const, label: "Medium", target: SLA_TARGETS.medium },
    { key: "low" as const, label: "Low", target: SLA_TARGETS.low },
  ];

  return (
    <div className="space-y-4">
      {priorities.map((priority) => {
        const avgTime = metrics.averageResolutionTimeByPriority[priority.key];
        const isCompliant = avgTime <= priority.target;
        const targetHours = priority.target;
        const targetDays = targetHours / 24;

        return (
          <div key={priority.key} className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-card/50">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{priority.label}</span>
                <Badge variant={isCompliant ? "default" : "destructive"}>
                  {isCompliant ? "On Target" : "Over Target"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Target: {targetDays < 1 ? `${targetHours}h` : `${targetDays.toFixed(1)}d`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {avgTime > 0 ? (
                  <>
                    {avgTime < 24 
                      ? `${avgTime.toFixed(1)}h`
                      : `${(avgTime / 24).toFixed(1)}d`}
                  </>
                ) : (
                  "N/A"
                )}
              </div>
              <div className="text-xs text-muted-foreground">Avg Resolution</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

