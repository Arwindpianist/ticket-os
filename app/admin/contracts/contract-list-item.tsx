"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ContractListItemProps {
  contract: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
  };
  tenantName: string;
  index: number;
}

export function ContractListItem({ contract, tenantName, index }: ContractListItemProps) {
  const startDate = new Date(contract.start_date);
  const endDate = new Date(contract.end_date);
  const today = new Date();
  const isActive = today >= startDate && today <= endDate;
  const isExpired = today > endDate;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={`/admin/contracts/${contract.id}`}
        className="block rounded-lg border border-border/30 p-4 transition-all duration-300 hover:border-primary/20 hover:bg-accent/30 shadow-inner-subtle hover:shadow-depth-sm group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                {contract.title}
              </h3>
              {isActive && <Badge variant="default">Active</Badge>}
              {isExpired && <Badge variant="secondary">Expired</Badge>}
              {today < startDate && <Badge variant="outline">Upcoming</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Tenant: {tenantName} • {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


