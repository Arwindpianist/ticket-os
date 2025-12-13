"use client";

import { ContractItemUsage } from "@/modules/contracts/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractItemUsageCardProps {
  usage: ContractItemUsage;
}

export function ContractItemUsageCard({ usage }: ContractItemUsageCardProps) {
  const getStatusBadge = () => {
    if (usage.isAtLimit) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          At Limit
        </Badge>
      );
    }
    if (usage.isNearLimit) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-yellow-500/50 text-yellow-500">
          <AlertTriangle className="h-3 w-3" />
          Near Limit
        </Badge>
      );
    }
    if (usage.limit) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Within Limit
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        {usage.itemType === "unlimited" ? "Unlimited" : "No Limit"}
      </Badge>
    );
  };

  const getProgressColor = () => {
    if (usage.usagePercentage >= 100) return "bg-destructive";
    if (usage.usagePercentage >= 80) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <Card className="border border-border/30 bg-card shadow-inner-subtle hover:shadow-depth-sm transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold line-clamp-2">{usage.itemText}</CardTitle>
            <CardDescription className="text-xs mt-1">{usage.contractTitle}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tickets</span>
          <span className="font-semibold">
            {usage.ticketCount}
            {usage.limit && ` / ${usage.limit}`}
          </span>
        </div>

        {usage.limit && (
          <>
            <Progress
              value={Math.min(usage.usagePercentage, 100)}
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {usage.limitPeriod === "monthly" && "This month"}
                {usage.limitPeriod === "quarterly" && "This quarter"}
                {usage.limitPeriod === "half_yearly" && "This half-year"}
                {usage.limitPeriod === "yearly" && "This year"}
              </span>
              <span className={cn(
                "font-medium",
                usage.usagePercentage >= 100 && "text-destructive",
                usage.usagePercentage >= 80 && usage.usagePercentage < 100 && "text-yellow-500"
              )}>
                {usage.usagePercentage.toFixed(0)}%
              </span>
            </div>
          </>
        )}

        {!usage.limit && (
          <div className="text-xs text-muted-foreground">
            {usage.itemType === "unlimited" 
              ? "Unlimited usage" 
              : "No limit configured"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

