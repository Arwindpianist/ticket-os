"use client";

import { ContractItemUsageStats } from "@/modules/contracts/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, TrendingUp, FileText } from "lucide-react";
import { ContractItemUsageCard } from "./contract-item-usage-card";
import { cn } from "@/lib/utils";

interface ContractItemUsageSummaryProps {
  stats: ContractItemUsageStats;
}

export function ContractItemUsageSummary({ stats }: ContractItemUsageSummaryProps) {
  const criticalItems = stats.usageByItem.filter(item => item.isAtLimit);
  const warningItems = stats.usageByItem.filter(item => item.isNearLimit);
  const healthyItems = stats.usageByItem.filter(
    item => !item.isAtLimit && !item.isNearLimit
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/30 bg-card shadow-inner-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.itemsWithLimits} with limits
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/30 bg-card shadow-inner-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all items
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          "border border-border/30 bg-card shadow-inner-subtle",
          stats.itemsAtLimit > 0 && "border-destructive/50"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              At Limit
              {stats.itemsAtLimit > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              stats.itemsAtLimit > 0 && "text-destructive"
            )}>
              {stats.itemsAtLimit}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          "border border-border/30 bg-card shadow-inner-subtle",
          stats.itemsNearLimit > 0 && "border-yellow-500/50"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Near Limit
              {stats.itemsNearLimit > 0 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              stats.itemsNearLimit > 0 && "text-yellow-500"
            )}>
              {stats.itemsNearLimit}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monitor closely
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Items Alert */}
      {criticalItems.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Items at Limit
            </CardTitle>
            <CardDescription>
              The following contract items have reached their usage limits and require attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {criticalItems.map((item) => (
                <ContractItemUsageCard key={item.contractItemId} usage={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Items */}
      {warningItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Items Near Limit (80%+)
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {warningItems.map((item) => (
              <ContractItemUsageCard key={item.contractItemId} usage={item} />
            ))}
          </div>
        </div>
      )}

      {/* All Items */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          All Contract Items
        </h3>
        {stats.usageByItem.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No contract items found.</p>
              <p className="text-sm mt-1">Add items to your contracts to track usage.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.usageByItem.map((item) => (
              <ContractItemUsageCard key={item.contractItemId} usage={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

