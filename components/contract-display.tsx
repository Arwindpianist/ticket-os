"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleRight, ToggleLeft, Hash, Infinity, MapPin, Home } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ContractItem {
  id: string;
  text: string;
  type: "text" | "toggle" | "limit" | "unlimited" | "location";
  enabled?: boolean;
  value?: number | string;
  location?: "remote" | "on-site" | "both";
}

interface ContractDisplayProps {
  summary: any;
}

export function ContractDisplay({ summary }: ContractDisplayProps) {
  // Handle different summary formats
  let items: ContractItem[] = [];

  if (summary && typeof summary === "object") {
    if ("items" in summary && Array.isArray(summary.items)) {
      // New structured format
      items = summary.items;
    } else if ("content" in summary && typeof summary.content === "string") {
      // Old plain text format - convert to text items
      items = summary.content
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string, index: number) => ({
          id: `item-${index}`,
          text: line.trim(),
          type: "text" as const,
        }));
    }
  }

  if (items.length === 0) {
    // Fallback: try to display as JSON
    return (
      <div className="rounded-md bg-muted/30 p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed shadow-inner-subtle">
        {typeof summary === "string"
          ? summary
          : JSON.stringify(summary, null, 2)}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={item.id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03 }}
        >
          <Card className="border border-border/30 bg-card/50 shadow-inner-subtle">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {item.text}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.type === "toggle" && (
                    <Badge
                      variant={item.enabled ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {item.enabled ? (
                        <ToggleRight className="h-3 w-3" />
                      ) : (
                        <ToggleLeft className="h-3 w-3" />
                      )}
                      {item.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  )}

                  {item.type === "limit" && item.value !== undefined && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {item.value}
                    </Badge>
                  )}

                  {item.type === "unlimited" && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Infinity className="h-3 w-3" />
                      Unlimited
                    </Badge>
                  )}

                  {item.type === "location" && item.location && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {item.location === "remote" ? (
                        <>
                          <Home className="h-3 w-3" />
                          Remote
                        </>
                      ) : item.location === "on-site" ? (
                        <>
                          <MapPin className="h-3 w-3" />
                          On-Site
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3" />
                          Both
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}


