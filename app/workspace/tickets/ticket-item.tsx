"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TicketItemProps {
  ticket: {
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
  };
  delay?: number;
}

export function TicketItem({ ticket, delay = 0 }: TicketItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link
        href={`/workspace/tickets/${ticket.id}`}
        className="block rounded-lg border border-border/30 p-4 transition-all duration-300 hover:border-primary/20 hover:bg-accent/30 shadow-inner-subtle hover:shadow-depth-sm group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                {ticket.title}
              </h3>
              <Badge
                variant={
                  ticket.status === "closed"
                    ? "secondary"
                    : ticket.status === "open"
                    ? "default"
                    : "outline"
                }
                className="transition-all duration-300 group-hover:scale-105"
              >
                {ticket.status}
              </Badge>
              <Badge 
                variant="outline"
                className="transition-all duration-300 group-hover:scale-105"
              >
                {ticket.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Created {new Date(ticket.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

